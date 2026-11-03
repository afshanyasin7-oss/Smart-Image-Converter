import apiClient from './apiClient';
import type {
  UploadResponse,
  ExtractResponse,
  GenerateRequest,
  ContentBlock,
  FileType,
  OcrLanguage,
  OcrEngine,
} from '../types/converter';

// Upload images to server
export async function uploadImages(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await apiClient.post<{ success: boolean; data: UploadResponse }>(
    '/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }
  );

  return response.data.data;
}

// Extract content from uploaded files (images and PDFs)
export async function extractContent(
  jobId: string,
  files: Array<{ id: string; filename: string; originalName: string; order: number; fileType?: FileType }>,
  language: OcrLanguage = 'eng+urd',
  ocrEngine: OcrEngine = 'auto'
): Promise<ExtractResponse> {
  const response = await apiClient.post<{ success: boolean; data: ExtractResponse }>(
    '/extract',
    { jobId, files, language, ocrEngine }
  );

  return response.data.data;
}

// Generate Excel file
export async function generateExcel(
  content: GenerateRequest['content'],
  options?: GenerateRequest['options']
): Promise<Blob> {
  const response = await apiClient.post('/generate/excel', { content, options }, {
    responseType: 'blob',
  });

  return response.data;
}

// Generate Word file
export async function generateWord(
  content: GenerateRequest['content'],
  options?: GenerateRequest['options']
): Promise<Blob> {
  const response = await apiClient.post('/generate/word', { content, options }, {
    responseType: 'blob',
  });

  return response.data;
}

// Cleanup job files on server
export async function cleanupJob(jobId: string): Promise<void> {
  await apiClient.delete(`/upload/${jobId}`);
}

// Download blob as file
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
