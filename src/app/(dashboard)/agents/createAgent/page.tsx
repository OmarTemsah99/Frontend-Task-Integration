import { AgentForm } from "@/components/agents/agent-form";
import { Suspense } from "react";
import { AgentFormSkeleton } from "@/components/agents/agent-form-skeleton";

export default function CreateAgentPage() {
  return (
    <Suspense fallback={<AgentFormSkeleton />}>
      <AgentForm mode="create" />
    </Suspense>
  );
}
