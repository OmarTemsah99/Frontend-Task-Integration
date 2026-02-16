"use client";

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "./collapsible-section";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export default function AgentBasicSettings({
  form,
  languages,
  languagesLoading,
  languagesError,
  voices,
  voicesLoading,
  voicesError,
  prompts,
  promptsLoading,
  promptsError,
  models,
  modelsLoading,
  modelsError,
  basicSettingsMissing,
}: any) {
  return (
    <>
      <CollapsibleSection
        title="Basic Settings"
        description="Add some information about your agent to get started."
        badge={basicSettingsMissing}
        defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="agentName"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>
                  Agent Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Sales Assistant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Describe what this agent does..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="callType"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>
                  Call Type <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select call type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="inbound">
                      Inbound (Receive Calls)
                    </SelectItem>
                    <SelectItem value="outbound">
                      Outbound (Make Calls)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>
                  Language <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}>
                  <FormControl>
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
                  </FormControl>
                  <SelectContent>
                    {languagesError && <p>{languagesError}</p>}
                    {languages.map((lang: any) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voice"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>
                  Voice <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}>
                  <FormControl>
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
                  </FormControl>
                  <SelectContent>
                    {voicesError && <p>{voicesError}</p>}
                    {voices.map((voice: any) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center gap-2">
                          {voice.name}
                          <Badge variant={"secondary"}>{voice.tag}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prompt"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>
                  Prompt <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}>
                  <FormControl>
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
                  </FormControl>
                  <SelectContent>
                    {promptsError && <p>{promptsError}</p>}
                    {prompts.map((prompt: any) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>
                  Model <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}>
                  <FormControl>
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
                  </FormControl>
                  <SelectContent>
                    {modelsError && <p>{modelsError}</p>}
                    {models.map((model: any) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latency"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>
                    Latency ({Number(field.value).toFixed(1)}s)
                  </FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(vals: any) => field.onChange(vals[0])}
                      min={0.3}
                      max={1}
                      step={0.1}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.3s</span>
                    <span>1.0s</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="speed"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Speed ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(vals: any) => field.onChange(vals[0])}
                      min={90}
                      max={130}
                      step={1}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>90%</span>
                    <span>130%</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Call Script"
        description="What would you like the AI agent to say during the call?">
        <FormField
          control={form.control}
          name="callScript"
          render={({ field }: any) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write your call script here..."
                  {...field}
                  rows={6}
                  maxLength={20000}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground text-right">
                {(field.value || "").length}/20000
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Service/Product Description"
        description="Add a knowledge base about your service or product.">
        <FormField
          control={form.control}
          name="serviceDescription"
          render={({ field }: any) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Describe your service or product..."
                  {...field}
                  rows={6}
                  maxLength={20000}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground text-right">
                {(field.value || "").length}/20000
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </CollapsibleSection>
    </>
  );
}
