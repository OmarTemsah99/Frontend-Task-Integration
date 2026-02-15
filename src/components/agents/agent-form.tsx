"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronDown, Upload, X, FileText, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLanguages,
  useModels,
  usePrompts,
  useVoices,
} from "@/hooks/use-api-data";
import { Spinner } from "@/components/ui/spinner";
import { uploadFileFlow } from "@/lib/file-upload";
import { Check, RefreshCw, Loader2 } from "lucide-react";

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive">{badge} required</Badge>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-6">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

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
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
}

export function AgentForm({ mode, initialData }: AgentFormProps) {
  // Form state — initialized from initialData when provided
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "");
  const [callType, setCallType] = useState(initialData?.callType ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "");
  const [voice, setVoice] = useState(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  // Call Script
  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");

  // Service/Product Description
  const [serviceDescription, setServiceDescription] = useState(
    initialData?.serviceDescription ?? "",
  );

  // Reference Data
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Call
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");

  // Badge counts for required fields
  const basicSettingsMissing = [
    agentName,
    callType,
    language,
    voice,
    prompt,
    model,
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
  const saveLabel = mode === "create" ? "Save Agent" : "Save Changes";

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
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button>{saveLabel}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Collapsible Sections */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Section 1: Basic Settings */}
          <CollapsibleSection
            title="Basic Settings"
            description="Add some information about your agent to get started."
            badge={basicSettingsMissing}
            defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">
                  Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g. Sales Assistant"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Call Type <span className="text-destructive">*</span>
                </Label>
                <Select value={callType} onValueChange={setCallType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">
                      Inbound (Receive Calls)
                    </SelectItem>
                    <SelectItem value="outbound">
                      Outbound (Make Calls)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Language <span className="text-destructive">*</span>
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        languagesLoading ? (
                          <>
                            Loading Languages... <Spinner />
                          </>
                        ) : (
                          "Select language"
                        )
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {languagesError && <p>{languagesError}</p>}

                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Voice <span className="text-destructive">*</span>
                </Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        voicesLoading ? (
                          <>
                            Loading Voices... <Spinner />
                          </>
                        ) : (
                          "Select voice"
                        )
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {voicesError && <p>{voicesError}</p>}

                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center gap-2">
                          {voice.name}

                          <Badge variant={"secondary"}>{voice.tag}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Prompt <span className="text-destructive">*</span>
                </Label>
                <Select value={prompt} onValueChange={setPrompt}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        promptsLoading ? (
                          <>
                            Loading Prompts... <Spinner />
                          </>
                        ) : (
                          "Select prompt"
                        )
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {promptsError && <p>{promptsError}</p>}

                    {prompts.map((prompt) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Prompt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Model <span className="text-destructive">*</span>
                </Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        modelsLoading ? (
                          <>
                            Loading Models... <Spinner />
                          </>
                        ) : (
                          "Select model"
                        )
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {modelsError && <p>{modelsError}</p>}

                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latency ({latency[0].toFixed(1)}s)</Label>
                  <Slider
                    value={latency}
                    onValueChange={setLatency}
                    min={0.3}
                    max={1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.3s</span>
                    <span>1.0s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Speed ({speed[0]}%)</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={90}
                    max={130}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>90%</span>
                    <span>130%</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Call Script */}
          <CollapsibleSection
            title="Call Script"
            description="What would you like the AI agent to say during the call?">
            <div className="space-y-2">
              <Textarea
                placeholder="Write your call script here..."
                value={callScript}
                onChange={(e) => setCallScript(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {callScript.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 4: Service/Product Description */}
          <CollapsibleSection
            title="Service/Product Description"
            description="Add a knowledge base about your service or product.">
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your service or product..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {serviceDescription.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 5: Reference Data */}
          <CollapsibleSection
            title="Reference Data"
            description="Enhance your agent's knowledge base with uploaded files.">
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop files here, or{" "}
                  <span className="text-primary underline">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted: .pdf, .doc, .docx, .txt, .csv, .xlsx, .xls
                </p>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((f) => (
                    <div
                      key={f.tempId}
                      className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm truncate">{f.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatFileSize(f.size)}
                            </span>
                            {f.status === "uploading" && (
                              <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden max-w-25">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${f.progress}%` }}
                                />
                              </div>
                            )}
                            {f.status === "error" && (
                              <span className="text-xs text-destructive">
                                {f.error}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {f.status === "completed" && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {f.status === "uploading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {f.status === "error" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => retryUpload(f.tempId)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => removeFile(f.tempId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-sm">No Files Available</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 6: Tools */}
          <CollapsibleSection
            title="Tools"
            description="Tools that allow the AI agent to perform call-handling actions and manage session control.">
            <FieldGroup className="w-full">
              <FieldLabel htmlFor="switch-hangup">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow hang up</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to hang up the
                      call
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-hangup" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-callback">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow callback</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to make
                      callbacks
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-callback" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-transfer">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Live transfer</FieldTitle>
                    <FieldDescription>
                      Select if you want to transfer the call to a human agent
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-transfer" />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </CollapsibleSection>
        </div>

        {/* Right Column — Sticky Test Call Card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Test Call
                </CardTitle>
                <CardDescription>
                  Make a test call to preview your agent. Each test call will
                  deduct credits from your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="test-first-name">First Name</Label>
                      <Input
                        id="test-first-name"
                        placeholder="John"
                        value={testFirstName}
                        onChange={(e) => setTestFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-last-name">Last Name</Label>
                      <Input
                        id="test-last-name"
                        placeholder="Doe"
                        value={testLastName}
                        onChange={(e) => setTestLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={testGender} onValueChange={setTestGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <PhoneInput
                      defaultCountry="EG"
                      value={testPhone}
                      onChange={(value) => setTestPhone(value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <Button className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Start Test Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky bottom save bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end">
          <Button>{saveLabel}</Button>
        </div>
      </div>
    </div>
  );
}
