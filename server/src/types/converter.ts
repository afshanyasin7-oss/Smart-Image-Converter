// Content block types extracted from OCR
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

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  order: number;
  fileType: FileType;
}

export interface UploadResponse {
  jobId: string;
  files: UploadedFile[];
  count: number;
}

// Supported OCR languages
export type OcrLanguage = 'eng' | 'urd' | 'eng+urd';

// Supported OCR engines
export type OcrEngine = 'tesseract' | 'google-vision' | 'auto';

export interface ExtractRequest {
  jobId: string;
  files: Array<{
    id: string;
    filename: string;
    originalName: string;
    order: number;
    fileType?: FileType;
  }>;
  language?: OcrLanguage;
  ocrEngine?: OcrEngine;
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
