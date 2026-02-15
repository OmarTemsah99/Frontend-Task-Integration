import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import EditAgentContent from "@/components/agents/EditAgentContent";

export default function EditAgentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <Spinner />
        </div>
      }>
      <EditAgentContent />
    </Suspense>
  );
}
