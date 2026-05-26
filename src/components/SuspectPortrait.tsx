'use client';

import type { EmotionalState } from '@/lib/types';

interface Props {
  name: string;
  portraitBase: string; // e.g., 'daniel', 'maya'
  state: EmotionalState;
  caseId: string;       // e.g., 'case-001'
}

const STATE_LABELS: Record<EmotionalState, string> = {
  neutral: 'ניטרלי',
  defensive: 'מגונן',
  nervous: 'לחוץ',
  angry: 'זועם',
  exhausted: 'מותש',
  broken: 'שבור',
};

const STATE_COLORS: Record<EmotionalState, string> = {
  neutral: 'text-neutral-400',
  defensive: 'text-amber-400',
  nervous: 'text-yellow-400',
  angry: 'text-orange-500',
  exhausted: 'text-purple-400',
  broken: 'text-red-500',
};

export function SuspectPortrait({ name, portraitBase, state, caseId }: Props) {
  const src = `/assets/${caseId}/${portraitBase}-${state}.png`;

  return (
    <div className="h-full flex flex-col bg-ink-900 border border-ink-700 rounded-lg overflow-hidden">
      <div className="flex-1 relative bg-ink-800 min-h-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={state}
          src={src}
          alt={`${name} — ${STATE_LABELS[state]}`}
          className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="p-4 border-t border-ink-700 bg-ink-900">
        <p className="font-serif text-xl text-neutral-100">{name}</p>
        <p className={`text-sm tracking-widest mt-1 ${STATE_COLORS[state]}`}>
          {STATE_LABELS[state]}
        </p>
      </div>
    </div>
  );
}
