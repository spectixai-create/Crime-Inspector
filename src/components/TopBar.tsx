'use client';

import type { ReactNode } from 'react';

interface TopBarProps {
  /** RTL visual right — case identity, title, or page name */
  start?: ReactNode;
  /** Optional centered region — counters, secondary info */
  center?: ReactNode;
  /** RTL visual left — primary actions, close, return */
  end?: ReactNode;
  /** Drop the bottom border (useful when the screen below has its own) */
  flush?: boolean;
}

export function TopBar({ start, center, end, flush = false }: TopBarProps) {
  return (
    <header
      className="topbar"
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--color-bg-main)',
        borderBottom: flush ? 'none' : '1px solid var(--color-border-soft)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 var(--space-8)',
        flexShrink: 0,
        zIndex: 10,
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
        {start}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {center}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)',
          minWidth: 0,
        }}
      >
        {end}
      </div>
    </header>
  );
}

/** Standard left-block: case number + serif title */
export function TopBarCaseIdentity({ caseNum, title }: { caseNum: string; title: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-small)',
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.06em',
        }}
      >
        תיק {caseNum}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-h3)',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </span>
    </div>
  );
}

/** Standard center block: remaining messages counter */
export function TopBarMessagesCounter({
  remaining,
  total,
}: { remaining: number; total: number }) {
  const color =
    remaining > 10
      ? 'var(--color-text-primary)'
      : remaining > 5
      ? 'var(--color-gold)'
      : 'var(--color-danger)';
  const pct = total > 0 ? remaining / total : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-body-size)',
          color,
          fontWeight: 'var(--weight-semibold)' as unknown as number,
        }}
      >
        {remaining} שאלות נותרו
      </span>
      <div
        style={{
          width: 96,
          height: 3,
          background: 'var(--color-border-soft)',
          overflow: 'hidden',
        }}
        aria-hidden
      >
        <div
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: color,
            transition: 'width var(--motion-slow) var(--ease-out), background var(--motion-slow) var(--ease-out)',
            marginInlineStart: 'auto',
          }}
        />
      </div>
    </div>
  );
}
