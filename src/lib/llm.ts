import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === 'sk-ant-REPLACE-ME') {
    throw new Error('ANTHROPIC_API_KEY missing — set it in .env.local');
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

export const MODEL = 'claude-sonnet-4-5';

export function extractJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  // Find the first { and matching last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in model output');
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
