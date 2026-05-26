import { NextRequest, NextResponse } from 'next/server';
import { buildSuspectSystemPrompt } from '@/lib/prompts';
import { getAnthropic, MODEL, extractJson } from '@/lib/llm';
import { CASES } from '@/data/cases';
import type {
  InterrogateRequest,
  InterrogateResponse,
  Message,
} from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: InterrogateRequest;
  try {
    body = (await req.json()) as InterrogateRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { caseId, messages, newMessage, evidencePresented } = body;
  const caseData = CASES[caseId];
  if (!caseData) {
    return NextResponse.json(
      { error: `Unknown caseId: ${caseId}` },
      { status: 400 }
    );
  }

  let client;
  try {
    client = getAnthropic();
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  // Prefix user message with evidence marker if presented
  let userContent = newMessage;
  if (evidencePresented) {
    const ev = caseData.evidence.find((e) => e.id === evidencePresented);
    if (ev) {
      userContent = `[הוצגה לך הראיה: ${ev.detail}]\n\n${newMessage}`;
    }
  }

  const history = (messages || []).map((m: Message) => {
    const ev = m.evidencePresented
      ? caseData.evidence.find((e) => e.id === m.evidencePresented)
      : null;
    const content =
      m.role === 'detective' && ev
        ? `[הוצגה לך הראיה: ${ev.detail}]\n\n${m.content}`
        : m.content;
    return {
      role: (m.role === 'detective' ? 'user' : 'assistant') as
        | 'user'
        | 'assistant',
      content,
    };
  });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: buildSuspectSystemPrompt(caseData),
      messages: [...history, { role: 'user', content: userContent }],
    });

    const raw =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    const parsed = extractJson<{
      reply: string;
      state: string;
      confessed: boolean;
      secretRevealed?: boolean;
    }>(raw);

    const validStates = [
      'neutral',
      'defensive',
      'nervous',
      'angry',
      'exhausted',
      'broken',
    ];
    const state = validStates.includes(parsed.state)
      ? parsed.state
      : 'neutral';

    // For innocent suspects, force confessed=false regardless of model output
    const isGuilty = caseData.groundTruth.isGuilty;
    const confessed = isGuilty ? parsed.confessed === true : false;

    const result: InterrogateResponse = {
      reply: parsed.reply ?? '',
      newState: state as InterrogateResponse['newState'],
      confessed,
      secretRevealed: parsed.secretRevealed === true,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('interrogate error', err);
    return NextResponse.json(
      { error: 'Interrogation failed: ' + (err as Error).message },
      { status: 500 }
    );
  }
}
