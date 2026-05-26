import type { GameSession, CaseData, EvaluateResponse } from './types';

export function fallbackScore(session: GameSession, caseData: CaseData): EvaluateResponse {
  const v = session.verdict;
  if (!v) {
    return {
      correct: false,
      stars: 0,
      summary: 'No verdict submitted.',
      truthReveal: caseData.groundTruth.actualSequence,
      breakdown: {
        verdictCorrect: false,
        evidenceQuality: 'insufficient',
        contradictionsCaught: 0,
        confessionExtracted: false,
      },
    };
  }

  const guilty = caseData.groundTruth.isGuilty;
  const charged = v.decision === 'charge';
  const verdictCorrect = guilty === charged;

  if (!verdictCorrect) {
    return {
      correct: false,
      stars: 0,
      summary: guilty
        ? `${caseData.suspect.name} walked free. The case will likely never be solved.`
        : `${caseData.suspect.name} was charged for a crime they did not commit. A serious miscarriage of justice.`,
      truthReveal: caseData.groundTruth.actualSequence,
      breakdown: {
        verdictCorrect: false,
        evidenceQuality: 'insufficient',
        contradictionsCaught: 0,
        confessionExtracted: false,
      },
    };
  }

  const conclusiveCited = v.evidenceCited.some((id) =>
    caseData.conclusiveEvidenceIds.includes(id)
  );
  const confessed = session.suspectState === 'broken';

  let stars: 0 | 1 | 2 | 3 | 4 | 5 = 3;
  if (guilty && conclusiveCited) stars = 4;
  if (guilty && conclusiveCited && confessed) stars = 5;
  if (!guilty) stars = v.justification.length > 100 ? 4 : 3;

  // Assistant penalty: cap at 4 stars if assistant was used at all
  const used = session.assistantUsageCount ?? 0;
  if (used > 0 && stars > 4) stars = 4;

  return {
    correct: true,
    stars,
    summary: guilty
      ? `${caseData.suspect.name} has been charged with ${caseData.crime.type.toLowerCase()}.${used > 0 ? ` החקירה נעזרה בעוזר חקירה ${used} פעמים.` : stars === 5 ? ' בלש עצמאי — חקירה ללא עזרה חיצונית.' : ''}`
      : `${caseData.suspect.name} has been released. The investigation continues.${used > 0 ? ` החקירה נעזרה בעוזר חקירה ${used} פעמים.` : stars === 5 ? ' בלש עצמאי — חקירה ללא עזרה חיצונית.' : ''}`,
    truthReveal: caseData.groundTruth.actualSequence,
    breakdown: {
      verdictCorrect: true,
      evidenceQuality: conclusiveCited
        ? 'conclusive'
        : v.evidenceCited.length >= 2
        ? 'sufficient'
        : 'partial',
      contradictionsCaught: 0,
      confessionExtracted: confessed,
    },
  };
}
