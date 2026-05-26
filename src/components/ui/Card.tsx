'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type CardSurface = 'surface-2' | 'surface-3' | 'paper';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Background surface token. Defaults to surface-2. */
  surface?: CardSurface;
  /** Padding scale token. Defaults to 'md' (--space-6). */
  padding?: CardPadding;
  /** Render a subtle 1px gold border (otherwise uses --color-border-subtle). */
  emphasized?: boolean;
  children?: ReactNode;
}

const SURFACE_BG: Record<CardSurface, string> = {
  'surface-2': 'var(--color-surface-2)',
  'surface-3': 'var(--color-surface-3)',
  'paper':     'var(--color-paper)',
};

const PADDING: Record<CardPadding, string> = {
  none: '0',
  sm:   'var(--space-4)',
  md:   'var(--space-6)',
  lg:   'var(--space-8)',
};

/**
 * Reusable Card surface. All visual values come from tokens — never
 * pass hardcoded colors via style props.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { surface = 'surface-2', padding = 'md', emphasized = false, children, style, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        background: SURFACE_BG[surface],
        color: surface === 'paper' ? 'var(--color-bg-main)' : 'var(--color-text-primary)',
        border: `1px solid ${emphasized ? 'var(--color-border-strong)' : 'var(--color-border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: PADDING[padding],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
