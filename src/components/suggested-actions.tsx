"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import type { ChatMessage } from "@/lib/types";
import { getAgentById } from "@/lib/ai/agents";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
};

// Agent-specific suggestions based on their capabilities
const getAgentSuggestions = (agentId: string): string[] => {
  const agent = getAgentById(agentId);
  
  if (!agent) {
    // Fallback for legacy models - use default podcast-focused suggestions
    return [
      "Generate podcast ideas from themes for different timelines",
      "Research competitors for my podcast idea using Firecrawl",
      "Organize my podcast episodes in Google Calendar",
      "Help me brainstorm podcast ideas focused on my niche and brand",
    ];
  }

  switch (agent.id) {
    case "ida":
      return [
        "Generate podcast ideas from themes for different timelines",
        "Recommend which episode ideas to pursue based on ROI and follower growth",
        "Create actionable episode plans from podcast themes",
        "Help me brainstorm podcast ideas focused on my niche and brand",
      ];
    case "astra":
      return [
        "Research competitors for my podcast idea using Firecrawl",
        "Validate if my podcast topic is unique and relevant",
        "Find what content topics are trending in my niche",
        "Compare my podcast idea against competitor content",
      ];
    case "ember":
      return [
        "Organize my podcast episodes in Google Calendar",
        "Create a production schedule with tasks for my next episode",
        "Plan my episode calendar based on my availability",
        "Set up episode tasks and deadlines in Google Calendar",
      ];
    default:
      return [
        "Generate podcast ideas from themes for different timelines",
        "Research competitors for my podcast idea using Firecrawl",
        "Organize my podcast episodes in Google Calendar",
        "Help me brainstorm podcast ideas focused on my niche and brand",
      ];
  }
};

function PureSuggestedActions({ chatId, sendMessage, selectedModelId }: SuggestedActionsProps) {
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
              window.history.replaceState({}, "", `/chat/${chatId}`);
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: suggestion }],
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
