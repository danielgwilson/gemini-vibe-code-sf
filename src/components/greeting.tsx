import { motion } from "framer-motion";
import { getAgentById } from "@/lib/ai/agents";
import { AgentAvatar } from "./agent-avatar";

export const Greeting = ({ selectedAgentId }: { selectedAgentId?: string }) => {
  const agent = selectedAgentId ? getAgentById(selectedAgentId) : null;

  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      {agent && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.3 }}
        >
          <AgentAvatar agentId={agent.id} size="lg" />
          <div>
            <div className="font-semibold text-lg">{agent.name}</div>
            <div className="text-sm text-muted-foreground">{agent.role}</div>
          </div>
        </motion.div>
      )}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        {agent ? `Hello! I'm ${agent.name}` : "Hello there!"}
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-xl text-muted-foreground md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        {agent ? agent.description : "How can I help you today?"}
      </motion.div>
    </div>
  );
};
