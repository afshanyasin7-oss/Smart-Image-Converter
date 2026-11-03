import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type {
  UploadedImage,
  ImageExtractionResult,
  ContentBlock,
  ConverterStep,
  OutputFormat,
  FileType,
  OcrLanguage,
} from '../../types/converter';
import * as converterService from '../../services/converterService';

/** Extract a user-friendly error message from an axios or generic error. */
function extractErrorMessage(err: unknown): string {
  // Direct string error
  if (typeof err === 'string') {
    return err;
  }

  if (err && typeof err === 'object') {
    const axiosErr = err as AxiosError<{ success?: boolean; error?: string; message?: string; statusCode?: number }>;

    // Server returned a JSON error body with structured error field
    if (axiosErr.response?.data?.error) {
      return axiosErr.response.data.error;
    }

    // Server returned a JSON body with message field instead
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }

    // Multer-style errors may have code + field properties
    const anyErr = err as Record<string, unknown>;
    if (anyErr.code === 'LIMIT_FILE_SIZE') {
      return 'One or more files exceed the 25MB size limit. Please reduce file size and try again.';
    }
    if (anyErr.code === 'LIMIT_FILE_COUNT') {
      return 'Too many files. Maximum 100 files allowed per upload.';
    }

    // Network / CORS / timeout errors
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

interface ConverterState {
  // Upload state
  images: UploadedImage[];
  jobId: string | null;
  uploadProgress: number;

  // Format selection
  selectedFormat: OutputFormat | null;

  // Language selection
  selectedLanguage: OcrLanguage;

  // Processing state
  extractionResults: ImageExtractionResult[];
  failedImages: Array<{ imageId: string; filename: string; reason: string }>;
  processingProgress: number;
  processingMessage: string;

  // Workflow state
  currentStep: ConverterStep;
  isProcessing: boolean;
  error: string | null;

  // Generated file
  generatedFileUrl: string | null;
  generatedFileName: string | null;
}

const initialState: ConverterState = {
  images: [],
  jobId: null,
  uploadProgress: 0,
  selectedFormat: null,
  selectedLanguage: 'eng+urd', // Default to English + Urdu
  extractionResults: [],
  failedImages: [],
  processingProgress: 0,
  processingMessage: '',
  currentStep: 'upload',
  isProcessing: false,
  error: null,
  generatedFileUrl: null,
  generatedFileName: null,
};

// Async thunks
export const uploadImages = createAsyncThunk(
  'converter/uploadImages',
  async (files: File[], { dispatch, rejectWithValue }) => {
    try {
      const response = await converterService.uploadImages(files, (progress) => {
        dispatch(setUploadProgress(progress));
      });
      return response;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const extractContent = createAsyncThunk(
  'converter/extractContent',
  async (_, { getState }) => {
    const state = getState() as { converter: ConverterState };
    const { jobId, images, selectedLanguage } = state.converter;

    if (!jobId) {
      throw new Error('No job ID found');
    }

    const filesToProcess = images
      .filter((img) => img.serverFilename)
      .map((img) => ({
        id: img.id,
        filename: img.serverFilename!,
        originalName: img.originalName,
        order: img.order,
        fileType: img.fileType,
      }));

    const response = await converterService.extractContent(jobId, filesToProcess, selectedLanguage);
    return response;
  }
);

export const generateDocument = createAsyncThunk(
  'converter/generateDocument',
  async (_, { getState }) => {
    const state = getState() as { converter: ConverterState };
    const { selectedFormat, extractionResults } = state.converter;

    if (!selectedFormat) {
      throw new Error('No format selected');
    }

    const content = extractionResults
      .filter((r) => r.success)
      .map((r) => ({
        imageId: r.imageId,
        filename: r.filename,
        originalName: r.originalName,
        order: r.order,
        blocks: r.blocks,
      }));

    let blob: Blob;
    let fileName: string;

    if (selectedFormat === 'xlsx') {
      blob = await converterService.generateExcel(content);
      fileName = 'extracted_content.xlsx';
    } else {
      blob = await converterService.generateWord(content);
      fileName = 'extracted_content.docx';
    }

    return { blob, fileName };
  }
);

export const cleanupJob = createAsyncThunk(
  'converter/cleanupJob',
  async (_, { getState }) => {
    const state = getState() as { converter: ConverterState };
    const { jobId } = state.converter;

    if (jobId) {
      await converterService.cleanupJob(jobId);
    }
  }
);

const converterSlice = createSlice({
  name: 'converter',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setStep: (state, action: PayloadAction<ConverterStep>) => {
      state.currentStep = action.payload;
    },
    setFormat: (state, action: PayloadAction<OutputFormat>) => {
      state.selectedFormat = action.payload;
    },
    setLanguage: (state, action: PayloadAction<OcrLanguage>) => {
      state.selectedLanguage = action.payload;
    },
    addImages: (state, action: PayloadAction<File[]>) => {
      const newImages: UploadedImage[] = action.payload.map((file, index) => {
        // Determine file type based on MIME type
        const fileType: FileType = file.type === 'application/pdf' ? 'pdf' : 'image';

        return {
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          filename: file.name,
          originalName: file.name,
          status: 'pending',
          order: state.images.length + index,
          fileType,
        };
      });
      state.images = [...state.images, ...newImages];
    },
    removeImage: (state, action: PayloadAction<string>) => {
      const imageIndex = state.images.findIndex((img) => img.id === action.payload);
      if (imageIndex !== -1) {
        // Revoke object URL to free memory
        URL.revokeObjectURL(state.images[imageIndex].previewUrl);
        state.images.splice(imageIndex, 1);
        // Reorder remaining images
        state.images.forEach((img, idx) => {
          img.order = idx;
        });
      }
    },
    updateBlock: (state, action: PayloadAction<{ resultIndex: number; blockIndex: number; content: ContentBlock['content'] }>) => {
      const { resultIndex, blockIndex, content } = action.payload;
      if (state.extractionResults[resultIndex]?.blocks[blockIndex]) {
        state.extractionResults[resultIndex].blocks[blockIndex].content = content;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // Upload images
    builder
      .addCase(uploadImages.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.images.forEach((img) => {
          if (img.status === 'pending') img.status = 'processing';
        });
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.jobId = action.payload.jobId;
        state.uploadProgress = 100;

        // Update images with server data
        action.payload.files.forEach((serverFile) => {
          const localImage = state.images.find((img) => img.originalName === serverFile.originalName);
          if (localImage) {
            localImage.id = serverFile.id;
            localImage.serverFilename = serverFile.filename;
            localImage.status = 'uploaded';
          }
        });
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.isProcessing = false;
        // rejectWithValue puts the message in payload; fallback to error.message
        const errorMessage = (action.payload as string) || extractErrorMessage(action.error);
        state.error = errorMessage;
        state.images.forEach((img) => {
          if (img.status === 'processing') {
            img.status = 'failed';
            img.error = errorMessage;
          }
        });
      });

    // Extract content
    builder
      .addCase(extractContent.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.processingProgress = 0;
        state.processingMessage = 'Starting OCR processing...';
        state.images.forEach((img) => {
          img.status = 'processing';
        });
      })
      .addCase(extractContent.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.extractionResults = action.payload.results;
        state.failedImages = action.payload.summary.failedImages;
        state.processingProgress = 100;
        state.processingMessage = `Completed: ${action.payload.summary.successful}/${action.payload.summary.total} images processed`;

        // Update image statuses
        action.payload.results.forEach((result) => {
          const image = state.images.find((img) => img.id === result.imageId);
          if (image) {
            image.status = result.success ? 'done' : 'failed';
            if (!result.success) {
              image.error = result.error;
            }
          }
        });
      })
      .addCase(extractContent.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = extractErrorMessage(action.error);
      });

    // Generate document
    builder
      .addCase(generateDocument.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.processingMessage = 'Generating document...';
      })
      .addCase(generateDocument.fulfilled, (state, action) => {
        state.isProcessing = false;
        const url = URL.createObjectURL(action.payload.blob);
        state.generatedFileUrl = url;
        state.generatedFileName = action.payload.fileName;
        state.processingMessage = 'Document generated successfully!';
      })
      .addCase(generateDocument.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = extractErrorMessage(action.error);
      });

    // Cleanup job
    builder
      .addCase(cleanupJob.fulfilled, (state) => {
        state.jobId = null;
      });
  },
});

export const {
  setUploadProgress,
  setStep,
  setFormat,
  setLanguage,
  addImages,
  removeImage,
  updateBlock,
  setError,
  reset,
} = converterSlice.actions;

export default converterSlice.reducer;
