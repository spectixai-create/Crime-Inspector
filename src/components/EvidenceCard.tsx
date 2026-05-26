'use client';

import type { Evidence } from '@/lib/types';
import { useGame } from '@/lib/gameState';
import { Badge, Button, Card } from './ui';

interface Props {
  evidence: Evidence;
  presented: boolean;
  staged: boolean;
}

const CATEGORY_LABELS: Record<Evidence['type'], string> = {
  physical: 'פיזי',
  document: 'מסמך',
  video: 'מצלמה',
  testimony: 'עדות',
  financial: 'פיננסי',
};

export function EvidenceCard({ evidence, presented, staged }: Props) {
  const stageEvidence = useGame((s) => s.stageEvidence);
  const openLightbox = useGame((s) => s.openLightbox);

  const handlePresent = () => {
    if (presented) return;
    stageEvidence(staged ? null : evidence.id);
  };

  return (
    <Card
      surface="surface-2"
      padding="none"
      emphasized={staged}
      style={{
        display: 'flex',
        flexDirection: 'column',
        opacity: presented ? 0.55 : 1,
        overflow: 'hidden',
      }}
      aria-label={`ראיה: ${evidence.label}`}
    >
      {/* Image — click anywhere on it to inspect */}
      <button
        onClick={() => openLightbox(evidence.id)}
        aria-label={`פתח לבדיקה: ${evidence.label}`}
        type="button"
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          width: '100%',
          padding: 0,
          border: 'none',
          background: 'var(--color-bg-main)',
          cursor: 'zoom-in',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={evidence.imageAsset}
          alt={evidence.label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform var(--motion-slow) var(--motion-ease)',
          }}
        />
      </button>

      <div
        style={{
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Badge variant="neutral" mono>
            {CATEGORY_LABELS[evidence.type] ?? evidence.type} · {evidence.id}
          </Badge>
          <Badge variant={presented ? 'gold' : 'neutral'}>
            {presented ? 'הוצג' : 'לא הוצג'}
          </Badge>
        </div>

        <h3
          className="t-h3"
          style={{ margin: 0 }}
        >
          {evidence.label}
        </h3>
        <p
          className="t-body-sm"
          style={{ margin: 0 }}
        >
          {evidence.description}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-2)',
          padding: '0 var(--space-5) var(--space-5)',
        }}
      >
        <Button
          variant="ghost"
          size="md"
          onClick={() => openLightbox(evidence.id)}
        >
          פתח לבדיקה
        </Button>
        <Button
          variant={staged ? 'secondary' : 'primary'}
          size="md"
          onClick={handlePresent}
          disabled={presented}
        >
          {presented ? 'הוצג ✓' : staged ? 'מסומנת ✓' : 'הצג לחשוד'}
        </Button>
      </div>
    </Card>
  );
}
