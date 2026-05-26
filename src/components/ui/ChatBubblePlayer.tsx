'use client';

import type { ReactNode } from 'react';

export interface ChatBubblePlayerProps {
  /** Body text or pre-rendered nodes. */
  children: ReactNode;
  /** If true, hides the "אתה" label (use on grouped consecutive messages). */
  hideLabel?: boolean;
  /** Optional pre-bubble element (e.g. a centered "evidence presented" event). */
  beforeBubble?: ReactNode;
}

/**
 * Player chat bubble.
 *
 * RTL: detective is "you" → row aligns to flex-start (visual right in RTL).
 * Max-width: 70% per spec.
 */
export function ChatBubblePlayer({ children, hideLabel = false, beforeBubble }: ChatBubblePlayerProps) {
  return (
    <div className="chat-row chat-row--detective">
      {beforeBubble}
      {!hideLabel && <span className="chat-label">אתה</span>}
      <div
        className="chat-bubble chat-bubble--detective"
        style={{ maxWidth: '70%', whiteSpace: 'pre-wrap' }}
      >
        {children}
      </div>
    </div>
  );
}
