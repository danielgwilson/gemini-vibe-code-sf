'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { getAgentById } from '@/lib/ai/agents';
import type { ChatMessage } from '@/lib/types';
import { Suggestion } from './elements/suggestion';
import type { VisibilityType } from './visibility-selector';

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
};

// Agent-specific suggestions based on their capabilities
const getAgentSuggestions = (agentId: string): string[] => {
  const agent = getAgentById(agentId);

  if (!agent) {
    // Fallback for legacy models - use default podcast-focused suggestions
    return [
      'Help me discover my podcast idea from scratch',
      'Help me plan my episode production schedule',
      'Help me prep for my next episode',
      "I want to start a podcast but don't know where to begin",
    ];
  }

  switch (agent.id) {
    case 'ida':
      return [
        'Help me discover my podcast idea from scratch',
        "I want to start a podcast but don't know where to begin",
        'Help me develop my podcast concept and brand voice',
        'Guide me through creating my first episode ideas',
      ];
    case 'astra':
      return [
        'Help me plan my episode production schedule',
        'I need to schedule my episodes in Google Calendar',
        'Create a production plan for my upcoming episodes',
        'Help me optimize my podcast production workflow',
      ];
    case 'ember':
      return [
        'Help me prep for my next episode',
        'I need to find a guest for my episode',
        'I have a recording ready for editing',
        'Help me create show notes and marketing assets',
      ];
    default:
      return [
        'Help me discover my podcast idea from scratch',
        'Help me plan my episode production schedule',
        'Help me prep for my next episode',
        "I want to start a podcast but don't know where to begin",
      ];
  }
};

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedModelId,
}: SuggestedActionsProps) {
  const suggestedActions = useMemo(() => {
    return getAgentSuggestions(selectedModelId);
  }, [selectedModelId]);

  return (
    <div
      className="grid w-full gap-2 sm:grid-cols-2"
      data-testid="suggested-actions"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={suggestedAction}
          transition={{ delay: 0.05 * index }}
        >
          <Suggestion
            className="h-auto w-full whitespace-normal p-3 text-left"
            onClick={(suggestion: string) => {
              window.history.replaceState({}, '', `/chat/${chatId}`);
              sendMessage({
                role: 'user',
                parts: [{ type: 'text', text: suggestion }],
              });
            }}
            suggestion={suggestedAction}
          >
            {suggestedAction}
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }

    return true;
  },
);
