"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  notifyAgentsChanged,
  useLanguages,
  useModels,
  usePrompts,
  useVoices,
} from "@/hooks/use-api-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import AgentBasicSettings from "./agent-basic-settings";
import AgentFileUploader from "./agent-file-uploader";
import AgentTestCallCard from "./agent-test-call-card";
import CollapsibleSection from "./collapsible-section";

import { createAgent, startTestCall, updateAgent } from "@/lib/api-client";
import { uploadFileFlow } from "@/lib/file-upload";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

interface UploadedFile {
  tempId: string;
  id?: string;
  name: string;
  size: number;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

const ACCEPTED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".csv",
  ".xlsx",
  ".xls",
];

// Form validation schema
const agentFormSchema = z.object({
  agentName: z
    .string()
    .min(3, "Agent name must be at least 3 characters")
    .max(50, "Agent name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s-_]+$/,
      "Agent name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  callType: z.string().min(1, "Call type is required"),
  language: z.string().min(1, "Language is required"),
  voice: z.string().min(1, "Voice is required"),
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().min(1, "Model is required"),
  latency: z.number(),
  speed: z.number(),
  callScript: z
    .string()
    .min(20, "Call script must be at least 20 characters")
    .max(2000, "Call script cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  serviceDescription: z
    .string()
    .min(20, "Service description must be at least 20 characters")
    .max(1000, "Service description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  allowHangUp: z.boolean(),
  allowCallback: z.boolean(),
  liveTransfer: z.boolean(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export interface AgentFormInitialData {
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
  tools?: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
  agentId?: string;
}

export function AgentForm({
  mode,
  initialData,
  agentId: agentIdProp,
}: AgentFormProps) {
  // Form Metadata
  const [agentId, setAgentId] = useState<string | undefined>(agentIdProp);

  // Form definition
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      agentName: initialData?.agentName ?? "",
      description: initialData?.description ?? "",
      callType: initialData?.callType ?? "",
      language: initialData?.language ?? "",
      voice: initialData?.voice ?? "",
      prompt: initialData?.prompt ?? "",
      model: initialData?.model ?? "",
      latency: initialData?.latency ?? 0.5,
      speed: initialData?.speed ?? 110,
      callScript: initialData?.callScript ?? "",
      serviceDescription: initialData?.serviceDescription ?? "",
      allowHangUp: initialData?.tools?.allowHangUp ?? false,
      allowCallback: initialData?.tools?.allowCallback ?? false,
      liveTransfer: initialData?.tools?.liveTransfer ?? false,
    },
  });

  const { isSubmitting } = form.formState;

  // Reference Data
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Call State
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [isTestCalling, setIsTestCalling] = useState(false);

  // Badge counts for required fields (Checking form values)
  const formValues = form.watch();
  const basicSettingsMissing = [
    formValues.agentName,
    formValues.callType,
    formValues.language,
    formValues.voice,
    formValues.prompt,
    formValues.model,
  ].filter((v) => !v).length;

  // File upload handlers
  const updateFileStatus = useCallback(
    (tempId: string, updates: Partial<UploadedFile>) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.tempId === tempId ? { ...file, ...updates } : file,
        ),
      );
    },
    [],
  );

  const uploadFile = useCallback(
    async (tempId: string, file: File) => {
      updateFileStatus(tempId, { status: "uploading", progress: 0 });

      try {
        const id = await uploadFileFlow(file, (progress) => {
          updateFileStatus(tempId, { progress });
        });
        updateFileStatus(tempId, { status: "completed", progress: 100, id });
      } catch {
        updateFileStatus(tempId, { status: "error", error: "Upload failed" });
      }
    },
    [updateFileStatus],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles: UploadedFile[] = [];
      const filesToUpload: { tempId: string; file: File }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (ACCEPTED_TYPES.includes(ext)) {
          const tempId = crypto.randomUUID();
          newFiles.push({
            tempId,
            name: file.name,
            size: file.size,
            file,
            status: "pending",
            progress: 0,
          });
          filesToUpload.push({ tempId, file });
        }
      }

      if (newFiles.length === 0) return;

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Trigger uploads
      filesToUpload.forEach(({ tempId, file }) => {
        uploadFile(tempId, file);
      });
    },
    [uploadFile],
  );

  const retryUpload = (tempId: string) => {
    const file = uploadedFiles.find((f) => f.tempId === tempId);
    if (file) {
      uploadFile(tempId, file.file);
    }
  };

  const removeFile = (tempId: string) => {
    // Local delete only - remove from UI state
    setUploadedFiles((prev) => prev.filter((f) => f.tempId !== tempId));
  };

  // Save Handler
  const onSubmit = async (values: AgentFormValues): Promise<boolean> => {
    const payload = {
      name: values.agentName,
      description: values.description || "",
      callType: values.callType,
      language: values.language,
      voice: values.voice,
      prompt: values.prompt,
      model: values.model,
      latency: values.latency,
      speed: values.speed,
      callScript: values.callScript || "",
      serviceDescription: values.serviceDescription || "",
      attachments: uploadedFiles
        .filter((f) => f.status === "completed" && f.id)
        .map((f) => f.id as string),
      tools: {
        allowHangUp: values.allowHangUp,
        allowCallback: values.allowCallback,
        liveTransfer: values.liveTransfer,
      },
    };

    try {
      let savedAgent;
      if (agentId) {
        savedAgent = await updateAgent(agentId, payload);
      } else {
        savedAgent = await createAgent(payload);
      }

      setAgentId(savedAgent.id);
      toast.success("Agent saved successfully!");
      notifyAgentsChanged();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to save agent. Please try again.");
      return false;
    }
  };

  const handleStartTestCall = async () => {
    // 1. Validate phone number
    if (!testPhone) {
      toast.error("Phone number is required for a test call.");
      return;
    }

    // 2. Auto-save the agent first if not yet saved (or if dirty?)
    // Triggering submit
    let saved = false;
    await form.handleSubmit(async (data) => {
      saved = await onSubmit(data);
    })();

    if (!saved) return;

    // 3. Make the test call
    setIsTestCalling(true);
    try {
      const result = await startTestCall(agentId!, {
        firstName: testFirstName,
        lastName: testLastName,
        gender: testGender,
        phoneNumber: testPhone,
      });
      toast.success(`Test call started!`, {
        description: `Call ID: ${result.callId}`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to start test call. Please try again.");
    } finally {
      setIsTestCalling(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = isSubmitting
    ? "Saving..."
    : mode === "create" && !agentId
      ? "Create Agent"
      : "Save Changes";

  const {
    languages,
    loading: languagesLoading,
    error: languagesError,
  } = useLanguages();

  const { voices, loading: voicesLoading, error: voicesError } = useVoices();

  const {
    prompts,
    loading: promptsLoading,
    error: promptsError,
  } = usePrompts();

  const { models, loading: modelsLoading, error: modelsError } = useModels();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{heading}</h1>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saveLabel}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AgentBasicSettings
              form={form}
              languages={languages}
              languagesLoading={languagesLoading}
              languagesError={languagesError}
              voices={voices}
              voicesLoading={voicesLoading}
              voicesError={voicesError}
              prompts={prompts}
              promptsLoading={promptsLoading}
              promptsError={promptsError}
              models={models}
              modelsLoading={modelsLoading}
              modelsError={modelsError}
              basicSettingsMissing={basicSettingsMissing}
            />

            <CollapsibleSection
              title="Reference Data"
              description="Enhance your agent's knowledge base with uploaded files.">
              <AgentFileUploader
                uploadedFiles={uploadedFiles}
                fileInputRef={fileInputRef}
                isDragging={isDragging}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleFiles={handleFiles}
                retryUpload={retryUpload}
                removeFile={removeFile}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Tools"
              description="Tools that allow the AI agent to perform call-handling actions and manage session control.">
              <FieldGroup className="w-full">
                <FormField
                  control={form.control}
                  name="allowHangUp"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="switch-hangup">
                        <Field
                          orientation="horizontal"
                          className="items-center">
                          <FieldContent>
                            <FieldTitle>Allow hang up</FieldTitle>
                            <FieldDescription>
                              Select if you would like to allow the agent to
                              hang up the call
                            </FieldDescription>
                          </FieldContent>
                          <FormControl>
                            <Switch
                              id="switch-hangup"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </Field>
                      </FieldLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowCallback"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="switch-callback">
                        <Field
                          orientation="horizontal"
                          className="items-center">
                          <FieldContent>
                            <FieldTitle>Allow callback</FieldTitle>
                            <FieldDescription>
                              Select if you would like to allow the agent to
                              make callbacks
                            </FieldDescription>
                          </FieldContent>
                          <FormControl>
                            <Switch
                              id="switch-callback"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </Field>
                      </FieldLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="liveTransfer"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="switch-transfer">
                        <Field
                          orientation="horizontal"
                          className="items-center">
                          <FieldContent>
                            <FieldTitle>Live transfer</FieldTitle>
                            <FieldDescription>
                              Select if you want to transfer the call to a human
                              agent
                            </FieldDescription>
                          </FieldContent>
                          <FormControl>
                            <Switch
                              id="switch-transfer"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </Field>
                      </FieldLabel>
                    </FormItem>
                  )}
                />
              </FieldGroup>
            </CollapsibleSection>
          </div>

          <div className="lg:col-span-1">
            <AgentTestCallCard
              testFirstName={testFirstName}
              setTestFirstName={setTestFirstName}
              testLastName={testLastName}
              setTestLastName={setTestLastName}
              testGender={testGender}
              setTestGender={setTestGender}
              testPhone={testPhone}
              setTestPhone={setTestPhone}
              handleStartTestCall={handleStartTestCall}
              isTestCalling={isTestCalling}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Sticky bottom save bar */}
        <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {saveLabel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
