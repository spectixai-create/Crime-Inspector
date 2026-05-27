'use client';

import { useEffect, useState, useMemo } from 'react';
import { useGame } from '@/lib/gameState';
import { getCase } from '@/data/cases';
import { EvidenceCard } from './EvidenceCard';
import { TopBar } from './TopBar';
import { Button } from './ui';
import type { Evidence } from '@/lib/types';

type FilterKey = 'all' | Evidence['type'];

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'הכל',
  document: 'מסמכים',
  video: 'מצלמות',
  financial: 'פיננסי',
  testimony: 'עדויות',
  physical: 'פיזי',
};

const FILTER_ORDER: FilterKey[] = ['all', 'document', 'video', 'financial', 'testimony', 'physical'];

export function EvidenceDrawer() {
  const open = useGame((s) => s.drawerOpen);
  const close = useGame((s) => s.closeDrawer);
  const session = useGame((s) => s.session);
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const counts = useMemo(() => {
    if (!session) return null;
    const c = getCase(session.caseId);
    const out: Record<FilterKey, number> = {
      all: c.evidence.length,
      document: 0,
      video: 0,
      financial: 0,
      testimony: 0,
      physical: 0,
    };
    for (const ev of c.evidence) out[ev.type]++;
    return out;
  }, [session]);

  if (!open || !session || !counts) return null;
  const c = getCase(session.caseId);
  const filtered = filter === 'all' ? c.evidence : c.evidence.filter((e) => e.type === filter);
  const caseNum = c.id.replace('case-', '');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="תיק ראיות"
      className="animate-fadeIn"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-overlay)' as unknown as number,
        background: 'var(--color-bg-main)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopBar
        start={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-body-sm-size)',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.06em',
              }}
            >
              תיק {caseNum}
            </span>
            <span
              className="t-h3"
              style={{ lineHeight: 1.15 }}
            >
              תיק הראיות
            </span>
          </div>
        }
        center={
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-body-sm-size)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {session.evidencePresented.length}/{c.evidence.length} הוצגו לחשוד
          </span>
        }
        end={
          <Button variant="secondary" onClick={close} aria-label="חזרה לחקירה">
            ← חזרה לחקירה
          </Button>
        }
      />

      {/* Filter row */}
      <div
        className="evidence-filters"
        style={{
          padding: 'var(--space-4) var(--space-8)',
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--color-surface-2)',
        }}
        role="tablist"
        aria-label="סינון ראיות לפי סוג"
      >
        {FILTER_ORDER.map((key) => {
          const active = filter === key;
          return (
            <Button
              key={key}
              variant={active ? 'secondary' : 'ghost'}
              size="md"
              onClick={() => setFilter(key)}
              role="tab"
              aria-selected={active}
              style={
                active
                  ? {
                      background: 'var(--color-gold-glow)',
                      borderColor: 'var(--color-gold-primary)',
                      color: 'var(--color-gold-primary)',
                    }
                  : undefined
              }
            >
              {FILTER_LABELS[key]} ({counts[key]})
            </Button>
          );
        })}
      </div>

      {/* Evidence grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-8)',
        }}
      >
        <div
          className="evidence-grid-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-6)',
            maxWidth: 'var(--layout-max-width)',
            margin: '0 auto',
          }}
        >
          {filtered.length === 0 && (
            <p
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              אין ראיות בקטגוריה זו.
            </p>
          )}
          {filtered.map((ev) => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              presented={session.evidencePresented.includes(ev.id)}
              staged={session.stagedEvidence === ev.id}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .evidence-grid-inner { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .evidence-grid-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
