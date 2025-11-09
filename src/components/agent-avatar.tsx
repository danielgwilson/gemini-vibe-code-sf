"use client";

import { getAgentById } from "@/lib/ai/agents";
import { cn } from "@/lib/utils";

export function AgentAvatar({
  agentId,
  size = "md",
  className,
}: {
  agentId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!agentId) return null;

  const agent = getAgentById(agentId);
  if (!agent) return null;

  const sizeClasses = {
    sm: "size-6",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br",
        agent.gradient,
        sizeClasses[size],
        "ring-2 ring-background",
        className,
      )}
    >
      {agent.imageUrl ? (
        <img
          src={agent.imageUrl}
          alt={agent.name}
          className={cn("rounded-full object-cover", sizeClasses[size])}
        />
      ) : (
        <span className="text-base">{agent.icon}</span>
      )}
    </div>
  );
}

export function AgentBadge({
  agentId,
  showRole = false,
}: {
  agentId?: string;
  showRole?: boolean;
}) {
  if (!agentId) return null;

  const agent = getAgentById(agentId);
  if (!agent) return null;

  return (
    <div className="flex items-center gap-1.5">
      <AgentAvatar agentId={agentId} size="sm" />
      <div className="flex flex-col">
        <span className="text-xs font-medium">{agent.name}</span>
        {showRole && (
          <span className="text-[10px] text-muted-foreground">{agent.role}</span>
        )}
      </div>
    </div>
  );
}

