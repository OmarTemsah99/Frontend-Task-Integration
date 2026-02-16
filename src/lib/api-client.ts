const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export interface AgentData {
  id?: string;
  name: string;
  description: string;
  callType: string;
  language: string;
  voice: string;
  prompt: string;
  model: string;
  latency: number;
  speed: number;
  callScript: string;
  serviceDescription: string;
  attachments: string[]; // Array of attachment IDs
  tools: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}

export async function createAgent(
  agent: Omit<AgentData, "id">,
): Promise<AgentData> {
  const response = await fetch(`${API_BASE_URL}/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agent),
  });

  if (!response.ok) {
    throw new Error(`Failed to create agent: ${response.statusText}`);
  }

  return response.json();
}

export async function updateAgent(
  id: string,
  agent: Partial<AgentData>,
): Promise<AgentData> {
  const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agent),
  });

  if (!response.ok) {
    throw new Error(`Failed to update agent: ${response.statusText}`);
  }

  return response.json();
}

export interface TestCallRequest {
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
}

export interface TestCallResponse {
  callId: string;
  status: string;
  message: string;
}

export async function startTestCall(
  agentId: string,
  data: TestCallRequest,
): Promise<TestCallResponse> {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}/test-call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to start test call: ${response.statusText}`);
  }

  return response.json();
}
