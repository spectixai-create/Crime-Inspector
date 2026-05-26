'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonWidth = 'auto' | 'full';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  /** Show a spinner and disable the button. Forwards `disabled` to the DOM. */
  loading?: boolean;
  /** Optional element rendered before the label (typically an icon). */
  leadingIcon?: ReactNode;
  /** Optional element rendered after the label (badge, count, hint). */
  trailingIcon?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger:    'btn btn-danger',
  ghost:     'btn btn-ghost',
  icon:      'btn btn-ghost btn-icon',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',     // 36px compact
  md: '',           // base .btn is 44px
  lg: 'btn-lg',     // 52px
};

/**
 * Reusable Button — single source of truth for all button styling.
 *
 * Rules:
 * - `variant="icon"` requires an explicit `aria-label` (icon-only buttons must
 *   never ship without a Hebrew accessible name).
 * - `loading` shows a spinner and disables the button. The displayed label
 *   stays visible so layout doesn't jump.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    width = 'auto',
    loading = false,
    leadingIcon,
    trailingIcon,
    children,
    className,
    disabled,
    type = 'button',
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  // Enforce: icon-only buttons MUST carry an aria-label.
  if (process.env.NODE_ENV !== 'production' && variant === 'icon' && !ariaLabel) {
    // eslint-disable-next-line no-console
    console.warn('[Button] variant="icon" requires an aria-label for accessibility.');
  }

  const classes = [
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    width === 'full' ? 'btn-w-full' : '',
    loading ? 'is-loading' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && leadingIcon && <span aria-hidden>{leadingIcon}</span>}
      {children}
      {!loading && trailingIcon && <span aria-hidden>{trailingIcon}</span>}
    </button>
  );
});

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 16,
        height: 16,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: 'var(--radius-pill)',
        animation: 'btnSpin 0.8s linear infinite',
      }}
    />
  );
}
