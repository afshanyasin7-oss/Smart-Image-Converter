// Content block types for extracted content
export type ContentBlockType = 'paragraph' | 'heading' | 'table' | 'list' | 'form' | 'text';

export interface TableData {
  headers: string[];
  rows: string[][];
  /** Per-cell confidence scores (parallel to rows). Values < 40 indicate low-confidence / unclear text. */
  cellConfidence?: number[][];
}

export interface ListData {
  items: string[];
  ordered: boolean;
}

export interface FormData {
  entries: Array<{ key: string; value: string }>;
}

export interface ContentBlock {
  type: ContentBlockType;
  content: string | TableData | ListData | FormData;
  confidence?: number;
  needsReview?: boolean;
}

// File types
export type FileType = 'image' | 'pdf';

// Image and upload types
export type ImageStatus = 'pending' | 'uploaded' | 'processing' | 'done' | 'failed';

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  filename: string;
  originalName: string;
  serverFilename?: string;
  status: ImageStatus;
  order: number;
  error?: string;
  fileType: FileType;
}

export interface ImageExtractionResult {
  imageId: string;
  filename: string;
  originalName: string;
  order: number;
  success: boolean;
  blocks: ContentBlock[];
  error?: string;
  processingTime?: number;
  fileType?: FileType;
}

// API response types
export interface UploadResponse {
  jobId: string;
  files: Array<{
    id: string;
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    order: number;
    fileType?: FileType;
  }>;
  count: number;
}

export interface ExtractResponse {
  jobId: string;
  results: ImageExtractionResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    failedImages: Array<{
      imageId: string;
      filename: string;
      reason: string;
    }>;
  };
}

export interface GenerateRequest {
  content: Array<{
    imageId: string;
    filename: string;
    originalName: string;
    order: number;
    blocks: ContentBlock[];
  }>;
  options?: {
    includePageNumbers?: boolean;
    title?: string;
  };
}

// Supported OCR languages
export type OcrLanguage = 'eng' | 'urd' | 'eng+urd';

// Supported OCR engines
export type OcrEngine = 'tesseract' | 'google-vision' | 'auto';

// Workflow step types
export type ConverterStep = 'upload' | 'select-format' | 'processing' | 'preview' | 'done';
export type OutputFormat = 'xlsx' | 'docx';
