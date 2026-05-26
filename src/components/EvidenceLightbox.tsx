'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useGame } from '@/lib/gameState';
import { getCase } from '@/data/cases';
import type { Evidence } from '@/lib/types';
import { Badge, Button, Modal } from './ui';

const CATEGORY_LABELS: Record<Evidence['type'], string> = {
  physical: 'פיזי',
  document: 'מסמך',
  video: 'מצלמה',
  testimony: 'עדות',
  financial: 'פיננסי',
};

export function EvidenceLightbox() {
  const id = useGame((s) => s.lightboxEvidenceId);
  const close = useGame((s) => s.closeLightbox);
  const closeDrawer = useGame((s) => s.closeDrawer);
  const stageEvidence = useGame((s) => s.stageEvidence);
  const session = useGame((s) => s.session);

  const c = getCase(session?.caseId);
  const evidence: Evidence | null = id ? c.evidence.find((e) => e.id === id) ?? null : null;

  const presented = !!(evidence && session?.evidencePresented?.includes(evidence.id));
  const staged = !!(evidence && session?.stagedEvidence === evidence.id);

  const handlePresent = () => {
    if (!evidence || presented) return;
    stageEvidence(staged ? null : evidence.id);
    close();
    closeDrawer();
  };

  return (
    <Modal
      open={!!evidence}
      onClose={close}
      ariaLabel={evidence ? `ראיה: ${evidence.label}` : 'ראיה'}
      maxWidth={1080}
      title={
        evidence ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span>{evidence.label}</span>
            <Badge variant={presented ? 'gold' : 'neutral'}>
              {presented ? 'הוצג לחשוד' : staged ? 'מסומנת' : 'לא הוצג'}
            </Badge>
            <Badge variant="neutral" mono>
              {CATEGORY_LABELS[evidence.type] ?? evidence.type}
            </Badge>
          </span>
        ) : null
      }
      footer={
        evidence ? (
          <>
            <Button variant="ghost" onClick={close}>סגור</Button>
            {!presented && (
              <Button variant="primary" onClick={handlePresent}>
                {staged ? 'בטל סימון' : 'הצג לחשוד'}
              </Button>
            )}
          </>
        ) : null
      }
    >
      {evidence && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div
            style={{
              background: 'var(--color-bg-main)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              minHeight: 360,
              maxHeight: '60vh',
            }}
          >
            <TransformWrapper
              minScale={1}
              maxScale={5}
              initialScale={1}
              centerOnInit
              doubleClick={{ mode: 'toggle', step: 1.5 }}
              wheel={{ step: 0.15 }}
              pinch={{ step: 5 }}
              panning={{ velocityDisabled: true }}
            >
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '60vh', minHeight: 360 }}
                contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evidence.imageAsset}
                  alt={evidence.label}
                  style={{
                    maxHeight: '60vh',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    userSelect: 'none',
                    display: 'block',
                  }}
                  draggable={false}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>

          <p
            className="t-body"
            style={{ margin: 0, color: 'var(--color-text-secondary)', textAlign: 'start' }}
          >
            {evidence.description}
          </p>

          <p
            className="t-caption"
            style={{ margin: 0, textAlign: 'center' }}
          >
            גלגל עכבר להגדלה · גרירה להזזה · ESC לסגירה
          </p>
        </div>
      )}
    </Modal>
  );
}
