'use client';

import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button, type ButtonVariant } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  /** Headline (serif). */
  title: string;
  /** One- or two-line body describing the consequence. */
  message: ReactNode;
  /** Label for the cancel button. Defaults to "בטל". */
  cancelLabel?: string;
  /** Label for the confirm button — should clearly name the action. */
  confirmLabel: string;
  /** Variant for the confirm button. Use 'danger' for destructive actions. */
  confirmVariant?: ButtonVariant;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Lightweight confirmation modal — used for destructive nav actions
 * (return to case selection, restart current case). Reuses the shared
 * Modal so it inherits focus trap, Esc-to-close, backdrop click, and
 * bottom-sheet behavior on mobile.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  cancelLabel = 'בטל',
  confirmLabel,
  confirmVariant = 'danger',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      ariaLabel={title}
      title={title}
      maxWidth={480}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-body-size)',
          lineHeight: 'var(--text-body-line)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {message}
      </p>
    </Modal>
  );
}
