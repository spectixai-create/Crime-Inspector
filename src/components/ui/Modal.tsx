'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Required accessible name (read by SRs as the modal title). */
  ariaLabel: string;
  /** Optional visible header element. If omitted, only the close button shows. */
  title?: ReactNode;
  /** Optional sub-header element rendered under the title. */
  subtitle?: ReactNode;
  /** Footer slot — typically a row of action buttons. */
  footer?: ReactNode;
  children: ReactNode;
  /** Width clamp. Defaults to 720px (spec). */
  maxWidth?: number;
  /** Set false to disable closing on backdrop click. Defaults true. */
  closeOnBackdrop?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Reusable Modal.
 * - Centered, surface-2, max-width clamp (720 default).
 * - shadow-modal + backdrop using --color-backdrop.
 * - z-index from --z-modal.
 * - Internal scroll if content exceeds max-height.
 * - Focus trap while open (Tab / Shift+Tab cycle inside).
 * - Esc closes. Backdrop click closes (unless disabled).
 * - Restores focus to the previously-active element on close.
 * - Locks body scroll while open.
 */
export function Modal({
  open,
  onClose,
  ariaLabel,
  title,
  subtitle,
  footer,
  children,
  maxWidth = 720,
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Esc closes
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      // Focus trap on Tab
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !dialogRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onKey]);

  // Body scroll lock + focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable inside dialog (microtask to wait for mount)
    const t = window.setTimeout(() => {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      focusables?.[0]?.focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const node = (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)' as unknown as number,
        background: 'var(--color-backdrop)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        animation: 'fadeIn var(--motion-base) var(--motion-ease)',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: 'calc(100vh - 64px)',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {(title || subtitle) && (
          <div
            style={{
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              {title && (
                <div
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: 'var(--text-h2-size)',
                    lineHeight: 'var(--text-h2-line)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {title}
                </div>
              )}
              {subtitle && (
                <div
                  style={{
                    marginTop: 'var(--space-1)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-body-sm-size)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
            <Button variant="ghost" size="md" onClick={onClose} aria-label="סגור">
              סגור ✕
            </Button>
          </div>
        )}

        <div
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: 'var(--space-4) var(--space-6)',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              background: 'var(--color-surface-1)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
