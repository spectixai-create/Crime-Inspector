'use client';

import type { ReactNode } from 'react';

export interface SystemMessageProps {
  /** Plain narrative text or pre-rendered nodes. */
  children: ReactNode;
  /** Optional small icon (emoji or element) shown before the text. */
  icon?: ReactNode;
  /**
   * If provided, the entire message becomes a button (e.g. "evidence shown"
   * lines that open the lightbox). Keeps the same italic / centered styling.
   */
  onClick?: () => void;
  /** Required accessible label when onClick is provided. */
  ariaLabel?: string;
}

/**
 * Lightweight in-chat system event.
 *
 * Centered, italic, --color-text-secondary, body-sm.
 * No background, no border — distinct from the player/suspect bubbles.
 *
 * Examples:
 *   "החשוד שתק לפני שענה."
 *   "הוצגה ראיה: קבלת חניון."
 *   "התשובה לא תואמת לפרט שכבר נאמר."
 *
 * IMPORTANT: must not expose hidden scoring, confession level, or
 * internal model state. Keep the language atmospheric/narrative.
 */
export function SystemMessage({ children, icon, onClick, ariaLabel }: SystemMessageProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="system-message system-message--clickable"
      >
        {icon && <span className="system-message__icon">{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }
  return (
    <div className="system-message" role="status" aria-live="polite">
      {icon && <span className="system-message__icon">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
