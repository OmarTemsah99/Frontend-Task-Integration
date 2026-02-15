const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

interface UploadUrlResponse {
  key: string;
  signedUrl: string;
}

interface RegisterAttachmentResponse {
  id: string;
}

export async function getUploadUrl(file: File): Promise<UploadUrlResponse> {
  const response = await fetch(`${API_BASE_URL}/attachments/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get upload URL");
  }

  return response.json();
}

export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to storage");
  }
}

export async function registerAttachment(
  key: string,
  file: File,
): Promise<RegisterAttachmentResponse> {
  const response = await fetch(`${API_BASE_URL}/attachments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to register attachment");
  }

  return response.json();
}

export async function uploadFileFlow(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // 1. Get signed URL
  if (onProgress) onProgress(10);
  const { key, signedUrl } = await getUploadUrl(file);

  // 2. Upload to S3/Storage
  if (onProgress) onProgress(30);
  // Note: Standard fetch doesn't support upload progress easily.
  // For a real progress bar during the PUT, we'd need generic XMLHttpRequest or axios.
  // We'll just fake steps for now since we're using fetch.
  await uploadFileToSignedUrl(signedUrl, file);
  if (onProgress) onProgress(80);

  // 3. Register attachment
  const { id } = await registerAttachment(key, file);
  if (onProgress) onProgress(100);

  return id;
}
