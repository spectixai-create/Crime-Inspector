'use client';

import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  | 'neutral'   // לא הוצג, פתוח, רגוע
  | 'gold'      // הוצג, מצב מתקדם
  | 'success'   // הושלם
  | 'danger'    // שגיאה, מצב קריטי
  | 'locked'    // נעול
  | 'inspect';  // נפתח לבדיקה

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Optional leading element (icon or dot). */
  leading?: ReactNode;
  /** Render with monospaced font for codes / IDs. */
  mono?: boolean;
  children: ReactNode;
}

const VARIANT: Record<BadgeVariant, { color: string; border: string; bg: string }> = {
  neutral: { color: 'var(--color-text-secondary)', border: 'var(--color-border-subtle)', bg: 'transparent' },
  gold:    { color: 'var(--color-gold-primary)',   border: 'var(--color-gold-dim)',       bg: 'var(--color-gold-glow)' },
  success: { color: 'var(--color-success)',         border: 'var(--color-success)',       bg: 'transparent' },
  danger:  { color: 'var(--color-danger)',          border: 'var(--color-danger-dim)',    bg: 'var(--color-danger-muted)' },
  locked:  { color: 'var(--color-text-muted)',      border: 'var(--color-text-muted)',    bg: 'transparent' },
  inspect: { color: 'var(--color-text-primary)',    border: 'var(--color-border-strong)', bg: 'var(--color-surface-3)' },
};

/**
 * Compact 24px-tall status badge. Use for case status, evidence status,
 * suspect-state pill, or any short categorical label.
 */
export function Badge({ variant = 'neutral', leading, mono = false, children, style, ...rest }: BadgeProps) {
  const v = VARIANT[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        height: 24,
        padding: '0 var(--space-3)',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
        fontSize: 'var(--text-caption-size)',
        lineHeight: 1,
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {leading && <span aria-hidden>{leading}</span>}
      {children}
    </span>
  );
}
