import type { Request, Response, NextFunction } from 'express';
import { generateExcel } from '../services/excelGenerator';
import { generateWord } from '../services/wordGenerator';
import type { GenerateRequest } from '../types/converter';

export const generateExcelFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: GenerateRequest = req.body;

    if (!data.content || !Array.isArray(data.content)) {
      res.status(400).json({
        success: false,
        error: 'Invalid request: content array is required',
        statusCode: 400,
      });
      return;
    }

    console.log(`[Generate] Creating Excel file with ${data.content.length} items`);

    const buffer = await generateExcel(data);

    // Set headers for file download
    const filename = data.options?.title
      ? `${data.options.title.replace(/[^a-z0-9]/gi, '_')}.xlsx`
      : 'extracted_content.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
    console.log(`[Generate] Excel file sent: ${filename}`);
  } catch (error) {
    next(error);
  }
};

export const generateWordFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: GenerateRequest = req.body;

    if (!data.content || !Array.isArray(data.content)) {
      res.status(400).json({
        success: false,
        error: 'Invalid request: content array is required',
        statusCode: 400,
      });
      return;
    }

    console.log(`[Generate] Creating Word file with ${data.content.length} items`);

    const buffer = await generateWord(data);

    // Set headers for file download
    const filename = data.options?.title
      ? `${data.options.title.replace(/[^a-z0-9]/gi, '_')}.docx`
      : 'extracted_content.docx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
    console.log(`[Generate] Word file sent: ${filename}`);
  } catch (error) {
    next(error);
  }
};
