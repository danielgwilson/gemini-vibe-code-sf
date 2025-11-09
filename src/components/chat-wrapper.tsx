"use client";

import { Suspense } from "react";
import { Chat } from "./chat";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";
import type { AppUsage } from "@/lib/usage";

function ChatWithSearchParams({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
}) {
  return (
    <Chat
      autoResume={autoResume}
      id={id}
      initialChatModel={initialChatModel}
      initialLastContext={initialLastContext}
      initialMessages={initialMessages}
      initialVisibilityType={initialVisibilityType}
      isReadonly={isReadonly}
    />
  );
}

export function ChatWrapper({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    }>
      <ChatWithSearchParams
        autoResume={autoResume}
        id={id}
        initialChatModel={initialChatModel}
        initialLastContext={initialLastContext}
        initialMessages={initialMessages}
        initialVisibilityType={initialVisibilityType}
        isReadonly={isReadonly}
      />
    </Suspense>
  );
}

