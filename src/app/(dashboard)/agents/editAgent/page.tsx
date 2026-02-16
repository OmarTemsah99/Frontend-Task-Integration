import { Suspense } from "react";
import { AgentFormSkeleton } from "@/components/agents/agent-form-skeleton";
import EditAgentContent from "@/components/agents/EditAgentContent";

export default function EditAgentPage() {
  return (
    <Suspense fallback={<AgentFormSkeleton />}>
      <EditAgentContent />
    </Suspense>
  );
}
