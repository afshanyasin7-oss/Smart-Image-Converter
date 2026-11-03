import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { UPLOADS_DIR } from '../paths';
import type { UploadResponse, UploadedFile, FileType } from '../types/converter';

// Store job data in memory (in production, use Redis or database)
const jobs = new Map<string, { files: UploadedFile[]; createdAt: Date }>();

// Cleanup old jobs after 1 hour
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [jobId, job] of jobs.entries()) {
    if (job.createdAt < oneHourAgo) {
      cleanupJobFiles(jobId).catch(console.error);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

export async function cleanupJobFiles(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  for (const file of job.files) {
    try {
      await fs.unlink(file.path);
      console.log(`[Upload] Cleaned up file: ${file.filename}`);
    } catch (error) {
      console.error(`[Upload] Failed to cleanup file ${file.filename}:`, error);
    }
  }

  jobs.delete(jobId);
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded',
        statusCode: 400,
      });
      return;
    }

    if (files.length > 100) {
      res.status(400).json({
        success: false,
        error: 'Maximum 100 images allowed per batch',
        statusCode: 400,
      });
      return;
    }

    const jobId = uuidv4();
    const uploadedFiles: UploadedFile[] = files.map((file, index) => {
      // Determine file type based on mimetype
      const fileType: FileType = file.mimetype === 'application/pdf' ? 'pdf' : 'image';

      return {
        id: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        order: index,
        fileType,
      };
    });

    // Store job data
    jobs.set(jobId, {
      files: uploadedFiles,
      createdAt: new Date(),
    });

    const response: UploadResponse = {
      jobId,
      files: uploadedFiles.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        path: `uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        order: file.order,
        fileType: file.fileType,
      })),
      count: uploadedFiles.length,
    };

    console.log(`[Upload] Job ${jobId} created with ${uploadedFiles.length} files`);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        success: false,
        error: 'Job ID is required',
        statusCode: 400,
      });
      return;
    }

    await cleanupJobFiles(jobId);

    res.json({
      success: true,
      message: 'Job files cleaned up successfully',
    });
  } catch (error) {
    next(error);
  }
};
