'use client';

import { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const handlePresent = () => {
    if (presented) return;
    stageEvidence(staged ? null : evidence.id);
  };

  const categoryLabel = CATEGORY_LABELS[evidence.type] ?? evidence.type;

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
      {/* Image area — falls back to a labeled placeholder if the file fails */}
      <button
        onClick={() => openLightbox(evidence.id)}
        aria-label={`פתח לבדיקה: ${evidence.label}`}
        type="button"
        className="evidence-image-container"
      >
        {!imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={evidence.imageAsset}
            alt={evidence.label}
            loading="lazy"
            onError={() => setImgError(true)}
            className="evidence-img"
          />
        ) : (
          <div className="evidence-img-fallback" role="img" aria-label={`תמונה לא זמינה: ${evidence.label}`}>
            <span className="fallback-icon" aria-hidden>⊟</span>
            <span className="fallback-text">תמונה לא זמינה</span>
            <span className="fallback-cat">{categoryLabel}</span>
          </div>
        )}
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
            {categoryLabel} · {evidence.id}
          </Badge>
          <Badge variant={presented ? 'gold' : 'neutral'}>
            {presented ? 'הוצג' : 'לא הוצג'}
          </Badge>
        </div>

        <h3 className="t-h3 evidence-title-text" style={{ margin: 0 }}>
          {evidence.label}
        </h3>
        <p className="t-body-sm evidence-desc-text" style={{ margin: 0 }}>
          {evidence.description}
        </p>
      </div>

      <div
        className="evidence-actions"
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
