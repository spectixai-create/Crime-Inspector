'use client';

import { useGame } from '@/lib/gameState';

export function StartScreen() {
  const startCase = useGame((s) => s.startCase);

  return (
    <main className="min-h-screen bg-radial flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-ink-900/70 border border-ink-700 rounded-lg p-10 shadow-2xl backdrop-blur-sm animate-fadeIn">
        <div className="text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-wider text-neutral-100">
            חוקר פלילי
          </h1>
          <p className="mt-2 text-sm tracking-[0.3em] text-neutral-500">
            חקירה — v0.1
          </p>

          <p className="mt-10 text-lg leading-relaxed text-neutral-300">
            תיק אחד. חשוד אחד. הוא יכול להיות אשם — והוא יכול להיות חף.
            יש לך עשרים שאלות. אחר כך אתה מחליט מה גורלו.
          </p>

          <button
            onClick={() => startCase('case-001')}
            className="mt-12 inline-flex items-center justify-center px-8 py-4 rounded border border-neutral-400 bg-neutral-100 text-ink-950 font-semibold tracking-wide hover:bg-white hover:scale-[1.02] transition-all"
          >
            התחל תיק 001 — רצח ארלוזורוב
          </button>
        </div>
      </div>
    </main>
  );
}
