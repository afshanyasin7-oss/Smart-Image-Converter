import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { UPLOADS_DIR } from '../paths';
import { uploadImages, deleteJob } from '../controllers/uploadController';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`[Upload] Multer destination resolved: ${UPLOADS_DIR}`);
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}-${file.originalname}`;
    console.log(`[Upload] Saving file as: ${uniqueName} (original: ${file.originalname}, mime: ${file.mimetype})`);
    cb(null, uniqueName);
  },
});

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB per file
const MAX_FILE_COUNT = 100;

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/octet-stream', // fallback for PDFs with incorrect MIME type
  ];
  console.log(`[Upload] File filter check: ${file.originalname} → ${file.mimetype}`);
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.originalname.toLowerCase().endsWith('.pdf') && file.mimetype === 'application/octet-stream') {
    // Accept octet-stream files that have a .pdf extension
    cb(null, true);
  } else {
    cb(new Error(`File "${file.originalname}" has an unsupported type (${file.mimetype}). Only JPG, JPEG, PNG, WEBP, and PDF are supported.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILE_COUNT,
  },
});

// POST /api/upload - Upload images
// Wrap Multer middleware to catch MulterError and forward to Express error handler
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(`[Upload] POST /api/upload — Content-Type: ${req.headers['content-type']}`);
  upload.array('images', 100)(req, res, (err) => {
    if (err) {
      console.error(`[Upload] Multer error: ${err.message} (code: ${(err as any).code})`);
      if (err instanceof multer.MulterError) {
        // Map Multer-specific error codes to user-friendly messages
        let message = err.message;
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            message = `One or more files exceed the 25MB size limit. Please reduce file size and try again.`;
            break;
          case 'LIMIT_FILE_COUNT':
            message = `Too many files. Maximum ${MAX_FILE_COUNT} files allowed per upload.`;
            break;
          case 'LIMIT_UNEXPECTED_FILE':
            message = `Unexpected field "${err.field}". Files must be sent under the "images" field name.`;
            break;
          default:
            message = `Upload error: ${err.message}`;
        }
        return res.status(400).json({
          success: false,
          error: message,
          statusCode: 400,
        });
      }
      // Non-Multer errors (e.g., fileFilter rejection) — pass to global error handler
      return next(err);
    }
    console.log(`[Upload] Multer succeeded — ${(req.files as Express.Multer.File[] | undefined)?.length ?? 0} file(s) received`);
    next();
  });
}, uploadImages);

// DELETE /api/upload/:jobId - Cleanup job files
router.delete('/:jobId', deleteJob);

export default router;
