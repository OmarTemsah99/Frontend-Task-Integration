"use client";

import React from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileText as FileTextIcon } from "lucide-react";
import { Check, Loader2, RefreshCw } from "lucide-react";

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

export default function AgentFileUploader({
  uploadedFiles,
  fileInputRef,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFiles,
  retryUpload,
  removeFile,
}: any) {
  return (
    <div className="space-y-4">
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

      {uploadedFiles.length > 0 ? (
        <div className="space-y-2">
          {uploadedFiles.map((f: any) => (
            <div
              key={f.tempId}
              className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileTextIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
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
          <FileTextIcon className="h-10 w-10 mb-2" />
          <p className="text-sm">No Files Available</p>
        </div>
      )}
    </div>
  );
}
