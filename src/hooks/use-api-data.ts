import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

// Agent refetch listener system
const agentListeners = new Set<() => void>();

export function notifyAgentsChanged() {
  agentListeners.forEach((listener) => listener());
}

// Type definitions
export interface Language {
  id: string;
  name: string;
  code: string;
}

export interface Voice {
  id: string;
  name: string;
  tag: string;
  language: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface Agent {
  id: number;
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
  attachments: number[];
  tools: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}

// Hook for fetching languages
export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/languages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch languages: ${response.statusText}`);
        }
        const data = await response.json();
        setLanguages(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch languages",
        );
        setLanguages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { languages, loading, error };
}

// Hook for fetching voices
export function useVoices() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/voices`);
        if (!response.ok) {
          throw new Error(`Failed to fetch voices: ${response.statusText}`);
        }
        const data = await response.json();
        setVoices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch voices");
        setVoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  return { voices, loading, error };
}

// Hook for fetching prompts
export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/prompts`);
        if (!response.ok) {
          throw new Error(`Failed to fetch prompts: ${response.statusText}`);
        }
        const data = await response.json();
        setPrompts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch prompts",
        );
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  return { prompts, loading, error };
}

// Hook for fetching models
export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/models`);
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch models");
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, loading, error };
}

// Hook for fetching agents
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetchCounterRef = useRef(0);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/agents`);
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agents");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    refetchCounterRef.current += 1;
    await fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    const listener = () => {
      refetch();
    };

    agentListeners.add(listener);
    return () => {
      agentListeners.delete(listener);
    };
  }, [refetch]);

  return { agents, loading, error, refetch };
}

// Hook for fetching agents
export function useAgentById(id: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentById = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/agents/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.statusText}`);
        }
        const data = await response.json();
        setAgent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agents");
        setAgent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentById();
  }, [id]);

  return { agent, loading, error };
}
