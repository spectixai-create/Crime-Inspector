import case001 from './case-001.json';
import case002 from './case-002.json';
import case003 from './case-003.json';
import type { CaseData } from '@/lib/types';

export const CASES: Record<string, CaseData> = {
  'case-001': case001 as unknown as CaseData,
  'case-002': case002 as unknown as CaseData,
  'case-003': case003 as unknown as CaseData,
};

export const CASE_ORDER: string[] = ['case-001', 'case-002', 'case-003'];

export function getCase(id: string | undefined | null): CaseData {
  if (id && CASES[id]) return CASES[id];
  return CASES['case-001'];
}
