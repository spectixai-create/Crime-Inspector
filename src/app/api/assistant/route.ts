import { NextRequest, NextResponse } from 'next/server';
import { buildAssistantSystemPrompt } from '@/lib/prompts';
import { getAnthropic, MODEL, extractJson } from '@/lib/llm';
import { CASES } from '@/data/cases';
import type { AssistantRequest, AssistantResponse } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: AssistantRequest;
  try {
    body = (await req.json()) as AssistantRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const caseData = CASES[body.caseId];
  if (!caseData) {
    return NextResponse.json({ error: `Unknown caseId: ${body.caseId}` }, { status: 400 });
  }

  let client;
  try {
    client = getAnthropic();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const systemPrompt = buildAssistantSystemPrompt(
    caseData,
    body.evidencePresented ?? []
  );

  const conversationSummary = (body.messages ?? [])
    .map((m) => {
      const speaker = m.role === 'detective' ? 'חוקר' : caseData.suspect.name;
      return `${speaker}: ${m.content}`;
    })
    .join('\n');

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `השיחה עד כה:\n\n${conversationSummary || '(טרם הוחלפו הודעות)'}\n\nהצע 4 כיווני חקירה.`,
        },
      ],
    });

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const parsed = extractJson<AssistantResponse>(raw);

    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length !== 4) {
      throw new Error('Assistant returned invalid number of suggestions');
    }

    // Validate shape of each item
    for (const s of parsed.suggestions) {
      if (typeof s.text !== 'string' || (s.type !== 'question' && s.type !== 'direction')) {
        throw new Error('Assistant returned malformed suggestion item');
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('assistant error', err);
    return NextResponse.json(
      { error: 'Assistant unavailable: ' + (err as Error).message },
      { status: 500 }
    );
  }
}
