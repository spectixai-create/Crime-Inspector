'use client';

import type { ReactNode } from 'react';

export interface SuspectResponseProps {
  /** Suspect display name (shown as the label). */
  suspectName: string;
  /** If true, hides the name label (grouped consecutive replies). */
  hideLabel?: boolean;
  /** Body text or pre-rendered nodes. */
  children: ReactNode;
}

/**
 * Suspect reply panel.
 *
 * RTL: row aligns to flex-end (visual left in RTL).
 * Max-width: 80% per spec, with internal cap of 720px for readability.
 * Visual: surface-2 background + 4px gold accent on start edge.
 */
export function SuspectResponse({ suspectName, hideLabel = false, children }: SuspectResponseProps) {
  return (
    <div className="chat-row chat-row--suspect">
      {!hideLabel && <span className="chat-label">{suspectName}</span>}
      <div
        className="chat-bubble chat-bubble--suspect"
        style={{
          maxWidth: 'min(720px, 80%)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {children}
      </div>
    </div>
  );
}
