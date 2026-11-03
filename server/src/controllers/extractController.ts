import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { getJob } from './uploadController';
import { processBatch } from '../services/ocrService';
import type { ExtractRequest, ExtractResponse, ImageExtractionResult, FileType, OcrLanguage, OcrEngine } from '../types/converter';
import { UPLOADS_DIR } from '../paths';

export const extractContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId, files, language, ocrEngine }: ExtractRequest = req.body;

    if (!jobId || !files || !Array.isArray(files)) {
      res.status(400).json({
        success: false,
        error: 'Invalid request: jobId and files array are required',
        statusCode: 400,
      });
      return;
    }

    // Validate and default language parameter
    const validLanguages: OcrLanguage[] = ['eng', 'urd', 'eng+urd'];
    const ocrLanguage: OcrLanguage = language && validLanguages.includes(language)
      ? language
      : 'eng+urd'; // Default to English + Urdu

    // Validate and default OCR engine parameter
    const validEngines: OcrEngine[] = ['tesseract', 'google-vision', 'auto'];
    const selectedEngine: OcrEngine = ocrEngine && validEngines.includes(ocrEngine)
      ? ocrEngine
      : 'auto'; // Default to auto-selection

    // Get job data
    const job = getJob(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: 'Job not found or expired',
        statusCode: 404,
      });
      return;
    }

    console.log(`[Extract] Starting extraction for job ${jobId} with ${files.length} files, language: ${ocrLanguage}, engine: ${selectedEngine}`);

    // Prepare files for processing (images and PDFs)
    const filesToProcess = files.map((file) => {
      const jobFile = job.files.find(f => f.id === file.id);
      return {
        id: file.id,
        path: jobFile?.path || path.join(UPLOADS_DIR, file.filename),
        filename: file.filename,
        originalName: file.originalName,
        order: file.order,
        fileType: file.fileType || jobFile?.fileType || 'image' as FileType,
      };
    });

    // Process files in batches with the specified language and engine
    const results = await processBatch(filesToProcess, 5, undefined, ocrLanguage, selectedEngine);

    // Build response
    const extractionResults: ImageExtractionResult[] = [];
    const failedImages: Array<{ imageId: string; filename: string; reason: string }> = [];

    for (const file of files) {
      const result = results.get(file.id);
      const fileType = file.fileType || 'image' as FileType;

      if (result) {
        if (result.success) {
          extractionResults.push({
            imageId: file.id,
            filename: file.filename,
            originalName: file.originalName,
            order: file.order,
            success: true,
            blocks: result.blocks,
            processingTime: result.processingTime,
            fileType,
          });
        } else {
          extractionResults.push({
            imageId: file.id,
            filename: file.filename,
            originalName: file.originalName,
            order: file.order,
            success: false,
            blocks: [],
            error: result.error,
            processingTime: result.processingTime,
            fileType,
          });
          failedImages.push({
            imageId: file.id,
            filename: file.filename,
            reason: result.error || 'Unknown error',
          });
        }
      } else {
        // Should not happen, but handle gracefully
        extractionResults.push({
          imageId: file.id,
          filename: file.filename,
          originalName: file.originalName,
          order: file.order,
          success: false,
          blocks: [],
          error: 'Processing result not found',
          fileType,
        });
        failedImages.push({
          imageId: file.id,
          filename: file.filename,
          reason: 'Processing result not found',
        });
      }
    }

    // Sort by order
    extractionResults.sort((a, b) => a.order - b.order);

    const response: ExtractResponse = {
      jobId,
      results: extractionResults,
      summary: {
        total: files.length,
        successful: extractionResults.filter(r => r.success).length,
        failed: failedImages.length,
        failedImages,
      },
    };

    console.log(`[Extract] Completed: ${response.summary.successful}/${response.summary.total} successful`);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};
