"use client";

import { AgentForm } from "./agent-form";
import { useAgentById } from "@/hooks/use-api-data";
import { useSearchParams } from "next/navigation";
import { Spinner } from "../ui/spinner";
import type { AgentFormInitialData } from "./agent-form";

export default function EditAgentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const { agent, loading, error } = useAgentById(id);

  if (!id) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">
          No agent selected. Please choose an agent from the sidebar.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner />
        <span className="ml-2 text-muted-foreground">Loading agent...</span>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-destructive">{error ?? "Agent not found."}</p>
      </div>
    );
  }

  const initialData: AgentFormInitialData = {
    agentName: agent.name,
    description: agent.description,
    callType: agent.callType,
    language: agent.language,
    voice: agent.voice,
    prompt: agent.prompt,
    model: agent.model,
    latency: agent.latency,
    speed: agent.speed,
    callScript: agent.callScript,
    serviceDescription: agent.serviceDescription,
    tools: agent.tools,
  };

  return (
    <AgentForm
      mode="edit"
      initialData={initialData}
      agentId={String(agent.id)}
    />
  );
}
