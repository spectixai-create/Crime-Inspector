import { NextRequest, NextResponse } from 'next/server';
import { buildEvaluatorSystemPrompt } from '@/lib/prompts';
import { getAnthropic, MODEL, extractJson } from '@/lib/llm';
import { fallbackScore } from '@/lib/scoring';
import { CASES } from '@/data/cases';
import type { EvaluateRequest, EvaluateResponse } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: EvaluateRequest;
  try {
    body = (await req.json()) as EvaluateRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const caseData = CASES[body.session?.caseId];
  if (!caseData) {
    return NextResponse.json(
      { error: `Unknown caseId in session: ${body.session?.caseId}` },
      { status: 400 }
    );
  }

  let client;
  try {
    client = getAnthropic();
  } catch (err) {
    console.warn('Anthropic unavailable, using fallback scoring', err);
    return NextResponse.json(fallbackScore(body.session, caseData));
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: buildEvaluatorSystemPrompt(caseData, body.session),
      messages: [
        {
          role: 'user',
          content: 'Evaluate the verdict per the rules above.',
        },
      ],
    });

    const raw =
      response.content[0]?.type === 'text' ? response.content[0].text : '';
    const parsed = extractJson<EvaluateResponse>(raw);

    if (
      typeof parsed.correct !== 'boolean' ||
      typeof parsed.stars !== 'number' ||
      !parsed.summary ||
      !parsed.truthReveal ||
      !parsed.breakdown
    ) {
      throw new Error('Evaluator returned malformed JSON');
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('evaluate error, falling back', err);
    return NextResponse.json(fallbackScore(body.session, caseData));
  }
}
