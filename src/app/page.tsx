'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/lib/gameState';
import { CaseSelector } from '@/components/CaseSelector';
import { CaseBrief } from '@/components/CaseBrief';
import { InterrogationRoom } from '@/components/InterrogationRoom';
import { VerdictScreen } from '@/components/VerdictScreen';
import { ResultScreen } from '@/components/ResultScreen';

export default function Page() {
  const session = useGame((s) => s.session);
  const [mounted, setMounted] = useState(false);

  // Wait for client mount so Zustand persisted state is loaded
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="min-h-screen bg-ink-950" />;
  }

  if (!session) {
    return <CaseSelector />;
  }

  switch (session.status) {
    case 'briefing':
      return <CaseBrief />;
    case 'interrogating':
      return <InterrogationRoom />;
    case 'verdict':
      return <VerdictScreen />;
    case 'completed':
      return <ResultScreen />;
    default:
      return <CaseSelector />;
  }
}
