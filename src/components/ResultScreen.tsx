'use client';

import { useEffect } from 'react';
import { useGame } from '@/lib/gameState';
import { getCase } from '@/data/cases';
import type { EvaluateResponse } from '@/lib/types';
import { getAudio } from '@/lib/audio';
import { Badge, Button, Card } from './ui';

const EVIDENCE_QUALITY_LABELS: Record<
  EvaluateResponse['breakdown']['evidenceQuality'],
  string
> = {
  insufficient: 'לא מספיק',
  partial: 'חלקי',
  sufficient: 'מספיק',
  conclusive: 'חותך',
};

export function ResultScreen() {
  const session = useGame((s) => s.session)!;
  const c = getCase(session.caseId);
  const reset = useGame((s) => s.reset);
  const result = session.result;
  const caseNum = c.id.replace('case-', '');

  useEffect(() => {
    if (!result) return;
    const audio = getAudio();
    audio.stopAllMusic();
    setTimeout(() => {
      if (result.correct) audio.oneshot('verdict-correct');
      else audio.oneshot('verdict-wrong');
    }, 600);
    if (result.stars > 0) {
      Array.from({ length: result.stars }).forEach((_, i) => {
        setTimeout(() => audio.sfx_play('star'), 500 + i * 150 + 100);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-main)',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
          מעריך את ההכרעה…
        </p>
      </main>
    );
  }

  const cited = session.verdict?.evidenceCited ?? [];
  const conclusiveIds = c.conclusiveEvidenceIds ?? [];

  const citedEv = cited
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => !!e);

  const missedConclusive = conclusiveIds
    .filter((id) => !cited.includes(id))
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => !!e);

  const isStrongEvidence = (id: string) =>
    conclusiveIds.includes(id) || c.evidence.find((e) => e.id === id)?.weight === 'strong';

  const stats: { label: string; value: string }[] = [
    { label: 'איכות הראיות', value: EVIDENCE_QUALITY_LABELS[result.breakdown.evidenceQuality] },
    { label: 'סתירות שנתפסו', value: String(result.breakdown.contradictionsCaught) },
    { label: 'הופקה הודאה',   value: result.breakdown.confessionExtracted ? 'כן' : 'לא' },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-main)',
        padding: 'var(--space-10) var(--pad-desktop)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 760 }}>
        <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
          תיק {caseNum} — {c.title}
        </p>

        <h1
          className="animate-stamp"
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'var(--fs-3xl)',
            fontWeight: 'var(--weight-medium)',
            margin: 0,
            lineHeight: 1.05,
            color: result.correct ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        >
          {result.correct ? 'ההכרעה נכונה' : 'ההכרעה שגויה'}
        </h1>

        {/* Stars */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-1)',
            marginTop: 'var(--space-5)',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="animate-stagger"
              style={{
                animationDelay: `${500 + i * 150}ms`,
                fontSize: 'var(--text-h1-size)',
                color: i < result.stars ? 'var(--color-gold-primary)' : 'var(--color-text-faint)',
                lineHeight: 1,
              }}
              aria-hidden
            >
              ★
            </span>
          ))}
          <span
            className="animate-stagger"
            style={{
              animationDelay: `${500 + 5 * 150}ms`,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-body-sm-size)',
              color: 'var(--color-text-muted)',
              marginInlineStart: 'var(--space-2)',
            }}
          >
            {result.stars}/5
          </span>
        </div>

        {/* Assistant usage badge / independence badge */}
        {(session.assistantUsageCount ?? 0) === 0 && result.correct ? (
          <div className="animate-fadeIn" style={{ marginTop: 'var(--space-4)' }}>
            <Badge variant="gold" leading={<span aria-hidden>⚐</span>}>
              בלש עצמאי
            </Badge>
          </div>
        ) : (session.assistantUsageCount ?? 0) > 0 ? (
          <p className="assisted-note" style={{ margin: 'var(--space-3) 0 0' }}>
            חקירה נעזרה בעוזר ×{session.assistantUsageCount}
          </p>
        ) : null}

        {/* Summary */}
        <section style={{ marginTop: 'var(--space-8)' }}>
          <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>סיכום</p>
          <p
            className="t-body-lg"
            style={{
              fontFamily: 'var(--font-title)',
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            {result.summary}
          </p>
        </section>

        {/* Stats */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-8)',
          }}
        >
          {stats.map(({ label, value }) => (
            <Card key={label} surface="surface-2" padding="md">
              <p className="section-header" style={{ marginBottom: 'var(--space-2)' }}>{label}</p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-h3-size)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                {value}
              </p>
            </Card>
          ))}
        </section>

        {/* Separator */}
        <div
          style={{ borderTop: '1px solid var(--color-border-subtle)', margin: 'var(--space-10) 0' }}
          aria-hidden
        />

        {/* Truth reveal */}
        <section>
          <p className="section-header" style={{ marginBottom: 'var(--space-4)' }}>האמת</p>
          <p
            style={{
              fontFamily: 'var(--font-title)',
              fontStyle: 'italic',
              fontSize: 'var(--text-body-size)',
              lineHeight: 1.8,
              color: 'var(--color-text-secondary)',
              maxWidth: 600,
              margin: 0,
            }}
          >
            {result.truthReveal}
          </p>
        </section>

        {/* Performance analysis */}
        <div
          style={{ borderTop: '1px solid var(--color-border-subtle)', margin: 'var(--space-10) 0' }}
          aria-hidden
        />

        <section>
          <h2 className="t-h2" style={{ margin: '0 0 var(--space-5)' }}>
            ניתוח הביצועים
          </h2>

          <div
            className="result-analysis-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-5)',
            }}
          >
            {/* Cited */}
            <div>
              <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                ראיות שהשתמשת בהן
              </p>
              {citedEv.length === 0 ? (
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-body-sm-size)',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  לא ציטטת אף ראיה.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {citedEv.map((ev) => {
                    const strong = isStrongEvidence(ev.id);
                    return (
                      <li key={ev.id}>
                        <Card
                          surface="surface-2"
                          padding="sm"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 'var(--space-2)',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--color-success)' }} aria-hidden>✓</span>
                            <span className="t-body-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {ev.label}
                            </span>
                          </span>
                          <Badge variant={strong ? 'success' : 'neutral'}>
                            {strong ? 'טוב' : 'נסיבתי'}
                          </Badge>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Missed */}
            <div>
              <p className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                ראיות שפספסת
              </p>
              {missedConclusive.length === 0 ? (
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-body-sm-size)',
                    color: 'var(--color-success)',
                  }}
                >
                  השתמשת בכל הראיות החותכות. עבודה טובה.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {missedConclusive.map((ev) => (
                    <li key={ev.id}>
                      <Card
                        surface="surface-2"
                        padding="sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--space-2)',
                          border: '1px solid var(--color-danger-dim)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span style={{ color: 'var(--color-danger)' }} aria-hidden>✗</span>
                          <span className="t-body-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {ev.label}
                          </span>
                        </span>
                        <Badge variant="danger">קריטית</Badge>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div
          style={{
            marginTop: 'var(--space-10)',
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button variant="primary" onClick={reset}>שחק תיק נוסף ←</Button>
          <Button variant="ghost" onClick={reset}>חזרה לבחירת תיקים</Button>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .result-analysis-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </main>
  );
}
