'use client';

import type { Message, Evidence } from '@/lib/types';
import { useGame } from '@/lib/gameState';
import {
  ChatBubblePlayer,
  SuspectResponse,
  SystemMessage,
  TypingIndicator,
} from './ui';

interface Props {
  message: Message;
  evidence?: Evidence;
  suspectName: string;
  suspectGender?: 'male' | 'female';
  hideLabel?: boolean;
}

/**
 * Routes a single message to the right Phase-1 chat primitive.
 * Detective messages with attached evidence emit a SystemMessage above
 * the bubble (the in-chat "ראיה הוצגה" announcement).
 */
export function MessageBubble({ message, evidence, suspectName, hideLabel }: Props) {
  const openLightbox = useGame((s) => s.openLightbox);

  if (message.role === 'detective') {
    const beforeBubble = evidence ? (
      <SystemMessage
        icon="⊢"
        onClick={() => openLightbox(evidence.id)}
        ariaLabel={`פתח את הראיה: ${evidence.label}`}
      >
        הוצגה ראיה: {evidence.label}
      </SystemMessage>
    ) : null;

    return (
      <ChatBubblePlayer hideLabel={hideLabel} beforeBubble={beforeBubble}>
        {message.content}
      </ChatBubblePlayer>
    );
  }

  return (
    <SuspectResponse suspectName={suspectName} hideLabel={hideLabel}>
      {message.content}
    </SuspectResponse>
  );
}

export function TypingBubble({
  suspectName,
  suspectGender,
}: {
  suspectName: string;
  suspectGender?: 'male' | 'female';
}) {
  return <TypingIndicator suspectName={suspectName} suspectGender={suspectGender} />;
}
