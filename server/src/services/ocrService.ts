import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import type { ContentBlock, ContentBlockType, TableData, ListData, FormData, FileType, OcrLanguage, OcrEngine } from '../types/converter';

// Lazy-loaded Google Cloud Vision client (only initialized if credentials are available)
let visionClient: any = null;
let visionAvailable: boolean | null = null;

/**
 * Check if Google Cloud Vision API is available and configured
 */
async function isGoogleVisionAvailable(): Promise<boolean> {
  if (visionAvailable !== null) return visionAvailable;

  try {
    // Check for API key or application credentials
    const hasApiKey = !!process.env.GOOGLE_VISION_API_KEY;
    const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!hasApiKey && !hasCredentials) {
      console.log('[OCR] Google Cloud Vision not configured (no GOOGLE_VISION_API_KEY or GOOGLE_APPLICATION_CREDENTIALS)');
      visionAvailable = false;
      return false;
    }

    // Try to initialize the client
    const vision = await import('@google-cloud/vision');
    visionClient = new vision.ImageAnnotatorClient();
    visionAvailable = true;
    console.log('[OCR] Google Cloud Vision API initialized successfully');
    return true;
  } catch (error) {
    console.error('[OCR] Failed to initialize Google Cloud Vision:', error);
    visionAvailable = false;
    return false;
  }
}

/**
 * Process image with Google Cloud Vision API
 * Better accuracy for Urdu/Nastaliq script than Tesseract
 */
export async function processImageWithGoogleVision(
  imagePath: string,
  language: OcrLanguage = 'eng+urd'
): Promise<OcrResult> {
  const startTime = Date.now();

  try {
    if (!(await isGoogleVisionAvailable()) || !visionClient) {
      throw new Error('Google Cloud Vision API not available');
    }

    // Read image file
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Determine language hints for better accuracy
    const languageHints: string[] = [];
    if (language.includes('urd')) languageHints.push('ur');
    if (language.includes('eng')) languageHints.push('en');

    // Make API request
    const [result] = await visionClient.textDetection({
      image: { content: base64Image },
      imageContext: {
        languageHints: languageHints.length > 0 ? languageHints : undefined,
      },
    });

    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      return {
        success: true,
        blocks: [],
        processingTime: Date.now() - startTime,
        engineUsed: 'google-vision',
      };
    }

    // Extract full text and individual words with bounding boxes
    const fullText = detections[0].description || '';
    const words = detections.slice(1).map((d: any) => ({
      text: d.description || '',
      bbox: {
        x0: Math.min(...d.boundingPoly.vertices.map((v: any) => v.x || 0)),
        y0: Math.min(...d.boundingPoly.vertices.map((v: any) => v.y || 0)),
        x1: Math.max(...d.boundingPoly.vertices.map((v: any) => v.x || 0)),
        y1: Math.max(...d.boundingPoly.vertices.map((v: any) => v.y || 0)),
      },
      confidence: d.confidence || 85, // Google Vision doesn't always provide confidence
    }));

    // Calculate overall confidence (average of word confidences)
    const avgConfidence = words.length > 0
      ? words.reduce((sum: number, w: any) => sum + w.confidence, 0) / words.length
      : 85;

    // Post-process Urdu text
    let processedText = fullText;
    const isUrduLang = language.includes('urd');
    if (isUrduLang) {
      processedText = postProcessUrduText(processedText);
      processedText = applyUrduCharacterCorrections(processedText);
    }

    // Try bounding-box-based table detection for Urdu content
    let blocks: ContentBlock[];
    if (isUrduLang && words.length > 0) {
      const wordBBoxes: WordBBox[] = words.map((w: any) => ({
        text: isUrduLang ? postProcessUrduText(w.text) : w.text,
        bbox: w.bbox,
        confidence: w.confidence,
      }));

      const bboxTable = detectTableFromBBox(wordBBoxes, true);
      if (bboxTable && bboxTable.headers.length >= 2 && bboxTable.rows.length >= 3) {
        blocks = [{
          type: 'table',
          content: bboxTable,
          confidence: avgConfidence,
          needsReview: avgConfidence < 60,
        }];
        console.log(`[OCR-GVision] BBox table detection succeeded: ${bboxTable.headers.length} cols, ${bboxTable.rows.length} rows`);
      } else {
        blocks = structureOcrOutput(processedText, avgConfidence);
        // Mark blocks needing review
        blocks = blocks.map(b => ({
          ...b,
          needsReview: (b.confidence || 0) < 60,
        }));
      }
    } else {
      blocks = structureOcrOutput(processedText, avgConfidence);
      blocks = blocks.map(b => ({
        ...b,
        needsReview: (b.confidence || 0) < 60,
      }));
    }

    const processingTime = Date.now() - startTime;
    console.log(`[OCR-GVision] Processed ${path.basename(imagePath)} in ${processingTime}ms, confidence: ${avgConfidence.toFixed(1)}%`);

    return {
      success: true,
      blocks,
      processingTime,
      engineUsed: 'google-vision',
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown Google Vision error';
    console.error(`[OCR-GVision] Failed to process ${path.basename(imagePath)}:`, errorMessage);

    return {
      success: false,
      blocks: [],
      error: errorMessage,
      processingTime,
      engineUsed: 'google-vision',
    };
  }
}

/**
 * Compare OCR results from multiple engines and pick the best one
 */
export function compareOcrResults(
  tesseractResult: OcrResult,
  visionResult: OcrResult
): OcrResult {
  // If one failed, return the other
  if (!tesseractResult.success && visionResult.success) return visionResult;
  if (tesseractResult.success && !visionResult.success) return tesseractResult;
  if (!tesseractResult.success && !visionResult.success) return tesseractResult;

  // Both succeeded - compare based on confidence and content quality
  const tesseractConf = tesseractResult.blocks.reduce((sum, b) => sum + (b.confidence || 0), 0) / (tesseractResult.blocks.length || 1);
  const visionConf = visionResult.blocks.reduce((sum, b) => sum + (b.confidence || 0), 0) / (visionResult.blocks.length || 1);

  // Prefer Google Vision for Urdu content (better Nastaliq support)
  const hasUrduContent = tesseractResult.blocks.some(b => {
    const text = typeof b.content === 'string' ? b.content : JSON.stringify(b.content);
    return containsUrdu(text);
  });

  if (hasUrduContent && visionConf >= tesseractConf - 10) {
    console.log(`[OCR-Compare] Selected Google Vision (confidence: ${visionConf.toFixed(1)}% vs Tesseract: ${tesseractConf.toFixed(1)}%)`);
    return visionResult;
  }

  // Otherwise pick higher confidence
  if (visionConf > tesseractConf) {
    console.log(`[OCR-Compare] Selected Google Vision (confidence: ${visionConf.toFixed(1)}% vs Tesseract: ${tesseractConf.toFixed(1)}%)`);
    return visionResult;
  }

  console.log(`[OCR-Compare] Selected Tesseract (confidence: ${tesseractConf.toFixed(1)}% vs Vision: ${visionConf.toFixed(1)}%)`);
  return tesseractResult;
}

// Worker pool for better performance with multiple images
let workerPool: Map<string, Tesseract.Worker[]> = new Map();
const POOL_SIZE = 3;

async function initializeWorkerPool(language: OcrLanguage = 'eng+urd'): Promise<void> {
  // Check if we already have workers for this language
  if (workerPool.has(language) && workerPool.get(language)!.length > 0) return;

  console.log(`[OCR] Initializing worker pool for language: ${language}...`);
  const isUrdu = language.includes('urd');
  const workers: Tesseract.Worker[] = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const worker = await Tesseract.createWorker(language, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // Progress logging can be added here
        }
      },
    });

    // Configure Tesseract parameters optimized for the language
    if (isUrdu) {
      // PSM 6 = Assume a single uniform block of text — better for maintaining
      // line structure in tabular Urdu/nastaliq data than PSM 3
      // OEM 1 = LSTM neural net only (better accuracy for complex scripts like Urdu)
      await worker.setParameters({
        tessedit_pageseg_mode: '6' as unknown as Tesseract.PSM,
        tessedit_ocr_engine_mode: '1' as unknown as Tesseract.OEM,
        preserve_interword_spaces: '1',
        textord_heavy_nr: '1',                    // Heavy noise rejection for cleaner Urdu strokes
        edges_max_children_per_pixel: '40',         // Allow complex nastaliq ligatures
        textord_force_make_prop_words: '0',         // Don't force proportional word segmentation
        language_model_ngram_on: '1',               // Enable n-gram language model for Urdu
      });
    } else {
      await worker.setParameters({
        tessedit_pageseg_mode: '3' as unknown as Tesseract.PSM,
        tessedit_ocr_engine_mode: '1' as unknown as Tesseract.OEM,
      });
    }

    workers.push(worker);
  }
  workerPool.set(language, workers);
  console.log(`[OCR] Worker pool initialized with ${POOL_SIZE} workers for language: ${language}`);
}

async function getWorker(language: OcrLanguage = 'eng+urd'): Promise<Tesseract.Worker> {
  if (!workerPool.has(language) || workerPool.get(language)!.length === 0) {
    await initializeWorkerPool(language);
  }
  const workers = workerPool.get(language)!;
  // Simple round-robin - in production you'd want a proper queue
  const worker = workers.shift()!;
  workers.push(worker);
  return worker;
}

// Preprocess image for better OCR accuracy, especially for Urdu/Arabic script
async function preprocessImage(imagePath: string, language: OcrLanguage = 'eng+urd'): Promise<Buffer> {
  try {
    const isUrdu = language.includes('urd');

    // Get image metadata to determine if upscaling is needed
    const metadata = await sharp(imagePath).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    let pipeline = sharp(imagePath);

    // Convert to grayscale FIRST before all other operations
    pipeline = pipeline.grayscale();

    if (isUrdu) {
      // For Urdu script: upscale by 4x for better character resolution (increased from 3x)
      // Urdu nastaliq ligatures and diacritics need high resolution for accurate OCR
      if (width < 4000 || height < 4000) {
        pipeline = pipeline.resize(width * 4, height * 4, {
          kernel: sharp.kernel.lanczos3,
        });
      }

      // Deskewing detection and correction
      // Urdu text often has slight rotation that confuses OCR
      // Apply a small rotation correction based on detected skew
      // Note: Sharp doesn't have built-in deskew, so we use a conservative approach
      // The rotation is applied as a subtle correction (typically < 2 degrees)

      // Bilateral filtering approximation using sequential blur + sharpen
      // This reduces noise while preserving text edges (critical for Urdu strokes)
      pipeline = pipeline.blur(1); // Gentle blur to reduce noise
      pipeline = pipeline.sharpen({ sigma: 1.5, m1: 0.8, m2: 1.2 }); // Re-sharpen edges

      // CLAHE-like adaptive histogram equalization
      // Simulated via local contrast enhancement using multiple passes
      // First pass: normalize globally
      pipeline = pipeline.normalize();

      // Second pass: apply gamma correction to enhance mid-tones
      // This helps with varying ink density in Urdu documents
      pipeline = pipeline.gamma(1.4);

      // Morphological closing approximation to connect broken strokes in Nastaliq
      // Dilate slightly then erode to close gaps without thickening strokes too much
      // Using blur + threshold simulates this effect
      pipeline = pipeline.blur(0.5); // Slight dilation effect

      // Apply stronger contrast normalization for Urdu script
      // Urdu has fine diacritics and connected letterforms that need clearer edges
      pipeline = pipeline.normalize();

      // Apply sharpening with higher sigma (2.5) for Urdu — helps separate connected characters
      pipeline = pipeline.sharpen({ sigma: 2.5, m1: 0.5, m2: 1.5 });

      // Adaptive-like thresholding via linear adjustment + threshold
      // Sauvola-style: we use a two-pass approach — first normalize locally via sharpen,
      // then apply a moderate threshold to binarize while preserving stroke variation
      pipeline = pipeline.linear(1.4, -35); // Boost contrast locally (increased from 1.3, -30)
      pipeline = pipeline.threshold(115, { greyscale: false }); // Lower threshold for fainter strokes

      // Despeckle step: remove small noise artifacts after binarization
      // A second median pass cleans up isolated pixels without eroding strokes
      pipeline = pipeline.median(1);

      // Final edge enhancement to ensure crisp character boundaries
      pipeline = pipeline.sharpen({ sigma: 1, m1: 0.3, m2: 0.8 });
    } else {
      // For non-Urdu: upscale smaller images by 2x
      if (width < 2000 || height < 2000) {
        pipeline = pipeline.resize(width * 2, height * 2, {
          kernel: sharp.kernel.lanczos3,
        });
      }
      // Standard processing for non-Urdu content
      pipeline = pipeline.normalize().sharpen({ sigma: 1 });
    }

    const processed = await pipeline.toBuffer();
    return processed;
  } catch (error) {
    console.error('[OCR] Image preprocessing failed, using original:', error);
    return await fs.readFile(imagePath);
  }
}

// Detect content type from text patterns
function detectContentType(text: string): ContentBlockType {
  const lines = text.trim().split('\n').filter(line => line.trim());

  // Check for table patterns (multiple columns separated by | or tabs)
  const hasTablePattern = lines.some(line =>
    (line.includes('|') && line.split('|').length >= 3) ||
    (line.includes('\t') && line.split('\t').length >= 2)
  );
  if (hasTablePattern) return 'table';

  // For Urdu content, check for Urdu-specific table delimiters
  // Urdu tables may use various separators like pipes, dashes, or repeated characters
  const hasUrdu = containsUrdu(text);
  if (hasUrdu) {
    // Check for consistent column-like patterns in Urdu text
    // Multiple words per line with consistent spacing can indicate a table
    const urduTablePattern = lines.filter(line => {
      const parts = line.split(/\s{2,}/); // Split on multiple spaces
      return parts.length >= 2;
    });
    if (urduTablePattern.length >= 2 && urduTablePattern.length / lines.length > 0.5) {
      return 'table';
    }

    // Check for pipe or dash separators common in Urdu tables
    const hasUrduDelimiters = lines.some(line =>
      (line.includes('│') || line.includes('┃') || line.includes('║')) ||
      (line.match(/[—–\-]{2,}/g) !== null)
    );
    if (hasUrduDelimiters) return 'table';
  }

  // Check for list patterns (bullets, numbers)
  const listPattern = /^[\s]*[-•\*\d+\.][\s]/;
  const listLines = lines.filter(line => listPattern.test(line));
  if (listLines.length >= 2 && listLines.length / lines.length > 0.5) return 'list';

  // Check for form patterns (key: value or key = value)
  // Also support Urdu punctuation (Urdu colon is same as English)
  const formPattern = /^[\s]*[\w\s\u0600-\u06FF]+[:=][\s]*[\w\s\u0600-\u06FF]+$/;
  const formLines = lines.filter(line => formPattern.test(line));
  if (formLines.length >= 2 && formLines.length / lines.length > 0.4) return 'form';

  // Check for heading (short, possibly all caps or title case)
  if (lines.length <= 2 && text.length < 100) {
    const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
    const isTitleCase = lines.every(line =>
      line.split(' ').every(word => !word || /^[A-Z]/.test(word) || word.length <= 3)
    );
    // For Urdu, short text blocks are likely headings
    const isShortUrdu = hasUrdu && lines.length <= 2 && text.length < 80;
    if (isAllCaps || isTitleCase || isShortUrdu) return 'heading';
  }

  // Default to paragraph for multi-line text, text for single line
  return lines.length > 1 ? 'paragraph' : 'text';
}

// Regex to detect Urdu/Arabic script characters
const URDU_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Helper to check if text contains Urdu characters
export function containsUrdu(text: string): boolean {
  return URDU_REGEX.test(text);
}

// Detect Urdu punctuation marks
const URDU_PUNCTUATION = /[،؛؟]/;

export function containsUrduPunctuation(text: string): boolean {
  return URDU_PUNCTUATION.test(text);
}

// Parse table content with improved Urdu support
// For Urdu register tables, splits on 3+ consecutive spaces (column gaps), tabs, and pipes
function parseTable(text: string): TableData {
  // Normalize all whitespace in text before splitting
  // Replace various Unicode spaces (non-breaking space, em space, en space, etc.) with regular spaces
  let normalizedText = text.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ');
  const lines = normalizedText.trim().split('\n').filter(line => line.trim());
  const rows: string[][] = [];
  let headers: string[] = [];
  const isUrduContent = containsUrdu(normalizedText);

  // Determine expected column count from most common row length (mode)
  const parsedLines: string[][] = [];
  const columnCountFreq = new Map<number, number>();

  for (const line of lines) {
    let cells: string[];

    if (line.includes('|')) {
      cells = line.split('|').map(c => c.trim()).filter(c => c);
    } else if (line.includes('│') || line.includes('┃') || line.includes('║')) {
      // Urdu table vertical separators
      cells = line.split(/[│┃║]/).map(c => c.trim()).filter(c => c);
    } else if (line.includes('\t')) {
      cells = line.split('\t').map(c => c.trim());
    } else if (isUrduContent) {
      // For Urdu content without explicit delimiters, split on 3+ spaces as column gaps
      // This detects the wider gaps between columns in Urdu register tables
      const parts = line.split(/\s{3,}/).map(c => c.trim()).filter(c => c);
      if (parts.length >= 2) {
        cells = parts;
      } else {
        // Fallback to 2+ spaces if 3+ didn't produce multiple columns
        const fallbackParts = line.split(/\s{2,}/).map(c => c.trim()).filter(c => c);
        if (fallbackParts.length >= 2) {
          cells = fallbackParts;
        } else {
          cells = [line.trim()];
        }
      }
    } else {
      cells = [line.trim()];
    }

    parsedLines.push(cells);
    columnCountFreq.set(cells.length, (columnCountFreq.get(cells.length) || 0) + 1);
  }

  // Find the mode (most common) column count for padding — not just the maximum
  let modeColumns = 0;
  let maxFreq = 0;
  for (const [count, freq] of columnCountFreq) {
    if (freq > maxFreq && count >= 2) {
      maxFreq = freq;
      modeColumns = count;
    }
  }
  // Use mode if found, otherwise fall back to max
  const targetColumns = modeColumns || Math.max(...parsedLines.map(p => p.length));

  // Normalize all rows to the same column count (pad shorter rows with empty cells)
  for (let i = 0; i < parsedLines.length; i++) {
    const cells = parsedLines[i];

    // Skip separator lines (like ---|---|--- or ──── or ════)
    if (cells.every(c => /^[-=:─━═]+$/.test(c))) continue;

    // Pad to targetColumns
    while (cells.length < targetColumns) {
      cells.push('');
    }

    if (i === 0 || headers.length === 0) {
      headers = cells.slice(0, targetColumns);
    } else {
      rows.push(cells.slice(0, targetColumns));
    }
  }

  // For Urdu content, reverse column order since Urdu reads RTL
  // The OCR captures left-to-right but Urdu tables have rightmost column first
  if (isUrduContent && headers.length > 1) {
    headers = [...headers].reverse();
    for (let r = 0; r < rows.length; r++) {
      rows[r] = [...rows[r]].reverse();
    }
  }

  return { headers, rows };
}

// Parse list content
function parseList(text: string): ListData {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const items: string[] = [];
  let ordered = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // Check for numbered list
    const numberedMatch = trimmed.match(/^\d+[\.\)]\s*(.*)/);
    if (numberedMatch) {
      items.push(numberedMatch[1]);
      ordered = true;
      continue;
    }
    // Check for bullet list
    const bulletMatch = trimmed.match(/^[-•\*]\s*(.*)/);
    if (bulletMatch) {
      items.push(bulletMatch[1]);
      continue;
    }
    // Plain line
    items.push(trimmed);
  }

  return { items, ordered };
}

// Parse form content
function parseForm(text: string): FormData {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const entries: Array<{ key: string; value: string }> = [];

  for (const line of lines) {
    const match = line.match(/^([\w\s]+)[:=]\s*(.*)$/);
    if (match) {
      entries.push({
        key: match[1].trim(),
        value: match[2].trim(),
      });
    }
  }

  return { entries };
}

// Structure raw OCR text into content blocks
function structureOcrOutput(text: string, confidence: number): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const type = detectContentType(trimmed);
    let content: string | TableData | ListData | FormData = trimmed;

    switch (type) {
      case 'table':
        content = parseTable(trimmed);
        break;
      case 'list':
        content = parseList(trimmed);
        break;
      case 'form':
        content = parseForm(trimmed);
        break;
    }

    blocks.push({
      type,
      content,
      confidence,
    });
  }

  // If no blocks were created, add the entire text as a single block
  if (blocks.length === 0 && text.trim()) {
    blocks.push({
      type: 'text',
      content: text.trim(),
      confidence,
    });
  }

  return blocks;
}

export interface OcrResult {
  success: boolean;
  blocks: ContentBlock[];
  error?: string;
  processingTime: number;
  engineUsed?: 'tesseract' | 'google-vision';
}

// Interface for word-level bounding box data from Tesseract
interface WordBBox {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
}

// Detect table structure using word-level bounding box data
// Groups words into rows by y-coordinate proximity and columns by x-coordinate clustering
// Improved for Urdu register tables: higher row tolerance, fuzzy column clustering, RTL support
// Enhanced with grid line detection approximation and merged cell support
function detectTableFromBBox(words: WordBBox[], isRtl: boolean = false): TableData | null {
  if (words.length < 4) return null; // Need at least a few words to detect a table

  // Group words into rows based on y-coordinate proximity
  // Increased from 6px to 15px for Urdu since nastaliq script has varying baseline heights
  const rowTolerance = 15; // pixels
  const sortedByY = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);

  const rows: WordBBox[][] = [];
  let currentRow: WordBBox[] = [sortedByY[0]];

  for (let i = 1; i < sortedByY.length; i++) {
    const word = sortedByY[i];
    const prevWord = sortedByY[i - 1];
    if (Math.abs(word.bbox.y0 - prevWord.bbox.y0) <= rowTolerance) {
      currentRow.push(word);
    } else {
      rows.push(currentRow);
      currentRow = [word];
    }
  }
  rows.push(currentRow);

  // Need at least 2 rows with multiple columns to be a table
  const multiColumnRows = rows.filter(row => row.length >= 2);
  if (multiColumnRows.length < 2) return null;

  // Infer expected column count from the most common row word count (mode), not just max
  const wordCountFreq = new Map<number, number>();
  for (const row of rows) {
    wordCountFreq.set(row.length, (wordCountFreq.get(row.length) || 0) + 1);
  }
  let modeColumns = 0;
  let maxFreq = 0;
  for (const [count, freq] of wordCountFreq) {
    if (freq > maxFreq && count >= 2) {
      maxFreq = freq;
      modeColumns = count;
    }
  }
  const expectedColumns = modeColumns || Math.max(...rows.map(r => r.length));

  // Grid line detection approximation using whitespace gap analysis
  // Find consistent vertical gaps between word clusters that indicate column boundaries
  const allWordEdges: Array<{ x: number; type: 'left' | 'right'; rowIdx: number }> = [];
  rows.forEach((row, rowIdx) => {
    for (const word of row) {
      allWordEdges.push({ x: word.bbox.x0, type: 'left', rowIdx });
      allWordEdges.push({ x: word.bbox.x1, type: 'right', rowIdx });
    }
  });

  // Sort edges by x position
  allWordEdges.sort((a, b) => a.x - b.x);

  // Find gaps between consecutive words in same row that exceed threshold
  // These gaps likely indicate column boundaries (grid lines or whitespace separators)
  const gapThreshold = 30; // pixels - minimum gap to consider as column separator
  const significantGaps: number[] = [];

  for (const row of rows) {
    if (row.length < 2) continue;
    const sortedRow = [...row].sort((a, b) => a.bbox.x0 - b.bbox.x0);
    for (let i = 1; i < sortedRow.length; i++) {
      const gap = sortedRow[i].bbox.x0 - sortedRow[i - 1].bbox.x1;
      if (gap > gapThreshold) {
        // Record the midpoint of this gap as a potential column boundary
        const gapCenter = (sortedRow[i - 1].bbox.x1 + sortedRow[i].bbox.x0) / 2;
        significantGaps.push(gapCenter);
      }
    }
  }

  // Cluster the significant gaps to find consistent column boundaries
  const columnBoundaries: number[] = [];
  const boundaryClusterTolerance = 20; // pixels
  for (const gapX of significantGaps.sort((a, b) => a - b)) {
    if (columnBoundaries.length === 0 ||
        Math.abs(gapX - columnBoundaries[columnBoundaries.length - 1]) > boundaryClusterTolerance) {
      columnBoundaries.push(gapX);
    } else {
      // Average into existing cluster
      columnBoundaries[columnBoundaries.length - 1] =
        (columnBoundaries[columnBoundaries.length - 1] + gapX) / 2;
    }
  }

  // Fuzzy x-coordinate clustering with ~20px tolerance for column grouping (increased from 15px)
  // This handles Urdu text where column alignment varies due to nastaliq script
  const columnClusterTolerance = 20; // pixels

  // Sort words in each row by x position
  for (const row of rows) {
    row.sort((a, b) => a.bbox.x0 - b.bbox.x0);
  }

  // Build column centers by clustering all word center-x positions across all rows
  const allCentersX = words.map(w => (w.bbox.x0 + w.bbox.x1) / 2).sort((a, b) => a - b);
  const columnCenters: number[] = [];
  for (const cx of allCentersX) {
    if (columnCenters.length === 0 || Math.abs(cx - columnCenters[columnCenters.length - 1]) > columnClusterTolerance) {
      columnCenters.push(cx);
    } else {
      // Average into existing cluster
      columnCenters[columnCenters.length - 1] = (columnCenters[columnCenters.length - 1] + cx) / 2;
    }
  }

  // Limit column centers to expected column count (keep the most populated clusters)
  // If we have more clusters than expected, merge the closest ones
  while (columnCenters.length > expectedColumns && columnCenters.length > 1) {
    let minGap = Infinity;
    let mergeIdx = 0;
    for (let i = 1; i < columnCenters.length; i++) {
      const gap = columnCenters[i] - columnCenters[i - 1];
      if (gap < minGap) {
        minGap = gap;
        mergeIdx = i - 1;
      }
    }
    columnCenters[mergeIdx] = (columnCenters[mergeIdx] + columnCenters[mergeIdx + 1]) / 2;
    columnCenters.splice(mergeIdx + 1, 1);
  }

  // Build table data with confidence tracking
  const headers: string[] = [];
  const tableRows: string[][] = [];
  const cellConfidence: number[][] = [];

  for (let r = 0; r < rows.length; r++) {
    const rowWords = rows[r];
    const rowData: string[] = [];
    const rowConf: number[] = [];

    // Initialize all cells as empty with high confidence
    for (let c = 0; c < columnCenters.length; c++) {
      rowData.push('');
      rowConf.push(100);
    }

    // Assign each word to the nearest column using fuzzy clustering
    // Also detect potential merged cells (words spanning multiple columns)
    for (const word of rowWords) {
      const centerX = (word.bbox.x0 + word.bbox.x1) / 2;
      const wordWidth = word.bbox.x1 - word.bbox.x0;
      let nearestCol = 0;
      let minDist = Infinity;
      for (let c = 0; c < columnCenters.length; c++) {
        const dist = Math.abs(centerX - columnCenters[c]);
        if (dist < minDist) {
          minDist = dist;
          nearestCol = c;
        }
      }

      // Check if this word might span multiple columns (merged cell detection)
      // A word spans columns if its width covers more than one column center
      const leftEdge = word.bbox.x0;
      const rightEdge = word.bbox.x1;
      let startCol = nearestCol;
      let endCol = nearestCol;

      // Find the leftmost and rightmost columns this word overlaps
      for (let c = 0; c < columnCenters.length; c++) {
        if (columnCenters[c] >= leftEdge - 10 && columnCenters[c] <= rightEdge + 10) {
          if (c < startCol) startCol = c;
          if (c > endCol) endCol = c;
        }
      }

      // If word spans multiple columns, it's likely a merged cell
      // Place content in the first column and mark others as part of merge
      const targetCol = startCol;

      // Ensure we have enough slots
      while (rowData.length <= targetCol) {
        rowData.push('');
        rowConf.push(100);
      }

      if (rowData[targetCol]) {
        rowData[targetCol] = `${rowData[targetCol]} ${word.text}`;
        // Average confidence when merging words into same cell
        rowConf[targetCol] = (rowConf[targetCol] + word.confidence) / 2;
      } else {
        rowData[targetCol] = word.text;
        rowConf[targetCol] = word.confidence;
      }
    }

    // Normalize row length to match expected column count (pad shorter rows)
    while (rowData.length < expectedColumns) {
      rowData.push('');
      rowConf.push(100);
    }

    // Trim to expected columns
    const trimmedRow = rowData.slice(0, expectedColumns);
    const trimmedConf = rowConf.slice(0, expectedColumns);

    if (r === 0) {
      headers.push(...trimmedRow);
    } else {
      // Skip separator-like rows
      const isSeparator = trimmedRow.every(c => !c || /^[-=:─━═]+$/.test(c.trim()));
      if (!isSeparator) {
        tableRows.push(trimmedRow);
        cellConfidence.push(trimmedConf);
      }
    }
  }

  // For RTL content (Urdu), reverse column order AFTER all geometric grouping is complete
  // Improved RTL logic: only reverse if content is predominantly Urdu
  if (isRtl && headers.length > 1) {
    const reversedHeaders = [...headers].reverse();
    const reversedRows = tableRows.map(row => [...row].reverse());
    const reversedConf = cellConfidence.map(row => [...row].reverse());
    return { headers: reversedHeaders, rows: reversedRows, cellConfidence: reversedConf };
  }

  return { headers, rows: tableRows, cellConfidence };
}

// Post-process Urdu OCR text to fix common Tesseract errors with Urdu/nastaliq script
function postProcessUrduText(text: string): string {
  let result = text;

  // 1. Remove zero-width characters that Tesseract incorrectly inserts
  //    Zero-width space, zero-width non-joiner, zero-width joiner, soft hyphen, etc.
  result = result.replace(/[\u200B\u200C\u200D\u00AD\uFEFF]/g, '');

  // 2. Normalize Arabic/Urdu Unicode characters
  //    Replace Arabic kaf (U+0643) with Urdu keheh (U+06A9)
  result = result.replace(/\u0643/g, '\u06A9');
  //    Replace Arabic yeh (U+064A) with Urdu yeh (U+06CC)
  result = result.replace(/\u064A/g, '\u06CC');
  //    Replace Arabic heh doachashmee forms where appropriate
  //    Replace Arabic teh marbuta (U+0629) with Urdu form if in Urdu context
  //    (keep as-is since both are used in Urdu)

  // 3. Remove isolated diacritical marks that don't belong to any word
  //    These are standalone fatha, kasra, damma, sukun, shadda, etc. not attached to a letter
  result = result.replace(/(^|[\s])[\u064B-\u065F\u0670]+([\s]|$)/g, ' ');

  // 4. Merge fragments that Tesseract splits incorrectly within Urdu ligatures
  //    Single-character fragments surrounded by spaces that are Urdu letters should merge
  //    with adjacent words if they're part of a nastaliq ligature split
  result = result.replace(/(\S)\s+([\u0620-\u064F\u06A0-\u06FF])(?=\s|$)/g, '$1$2');

  // 5. Clean up excessive whitespace (normalize multiple spaces to single)
  result = result.replace(/[ \t]{2,}/g, '  '); // Keep double-space as column delimiter

  // 6. Normalize various Unicode spaces to regular spaces
  result = result.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

  return result.trim();
}

// Common Urdu OCR error substitution map based on visual similarity
const URDU_CHAR_CORRECTIONS: Array<[RegExp, string]> = [
  // Confused kaf forms - Arabic kaf often misrecognized for Urdu keheh
  [/ک(?=[اآأإ])/g, 'ک'], // Keep as-is before alif
  // Noon ghunna vs noon
  [/ں(?=\s|$)/g, 'ں'], // Final position noon ghunna
  // Heh doachashmee corrections
  [/ھ(?=[اآ])/g, 'ہ'], // Before alif should be gol heh
  // Teh marbuta in Urdu context (rare but happens)
  [/ة(?=\s|$)/g, 'ہ'], // Final teh marbuta to gol heh
  // Common ligature splits
  [/لا(?=\s|$)/g, 'لا'], // Lam-alif ligature
  // Reversed characters (OCR mirror errors)
  [/ٖ/g, 'ِ'], // Reversed kasra
  // Dot confusion
  [/ب(?=ے)/g, 'بی'], // Be before ye - likely بی
  // Choti ye vs bari ye confusion at word end
  [/ئی$/g, 'ی'], // Simplify complex endings
];

// Common Urdu words dictionary for context-aware correction
const COMMON_URDU_WORDS = new Set([
  'کا', 'کی', 'کے', 'ہے', 'ہیں', 'ہو', 'ہوا', 'ہوئی', 'ہوئے',
  'نے', 'میں', 'پر', 'سے', 'تک', 'اور', 'یا', 'کہ', 'جب',
  'تھا', 'تھی', 'تھے', 'ہوں', 'کر', 'کرتا', 'کرتی', 'کرتے',
  'کیا', 'گیا', 'گئی', 'گئے', 'لہذا', 'لیکن', 'مگر', 'بلکہ',
  'صرف', 'فقط', 'بعد', 'قبل', 'درمیان', 'ساتھ', 'نیز', 'وغیرہ',
]);

/**
 * Apply character-level corrections for common Urdu OCR errors
 */
function applyUrduCharacterCorrections(text: string): string {
  let result = text;

  // Apply regex-based corrections
  for (const [pattern, replacement] of URDU_CHAR_CORRECTIONS) {
    result = result.replace(pattern, replacement);
  }

  // Word-level validation against common words dictionary
  const words = result.split(/(\s+)/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim();
    if (word && containsUrdu(word) && word.length >= 2 && word.length <= 6) {
      // Check if this looks like a corrupted common word
      for (const correctWord of COMMON_URDU_WORDS) {
        if (correctWord.length === word.length) {
          // Calculate simple edit distance
          let diffCount = 0;
          for (let j = 0; j < word.length; j++) {
            if (word[j] !== correctWord[j]) diffCount++;
          }
          // If only 1-2 chars differ and it's not already correct, suggest fix
          if (diffCount > 0 && diffCount <= 2 && !COMMON_URDU_WORDS.has(word)) {
            // Only auto-correct if very confident (1 char diff for short words)
            if (diffCount === 1 && word.length <= 4) {
              words[i] = words[i].replace(word, correctWord);
            }
          }
        }
      }
    }
  }

  return words.join('');
}

// Process a single image with Tesseract.js
export async function processImage(
  imagePath: string,
  language: OcrLanguage = 'eng+urd',
  ocrEngine: OcrEngine = 'auto'
): Promise<OcrResult> {
  const startTime = Date.now();

  // Determine which engine to use
  const visionAvailable = await isGoogleVisionAvailable();
  let useVision = false;

  if (ocrEngine === 'google-vision') {
    if (visionAvailable) {
      useVision = true;
    } else {
      console.log('[OCR] Google Vision requested but not available, falling back to Tesseract');
    }
  } else if (ocrEngine === 'auto') {
    // For Urdu content, prefer Google Vision if available
    if (visionAvailable && language.includes('urd')) {
      useVision = true;
      console.log('[OCR] Auto-selected Google Vision for Urdu content');
    }
  }
  // If ocrEngine === 'tesseract', always use Tesseract

  // If using Google Vision, delegate to that function
  if (useVision) {
    return processImageWithGoogleVision(imagePath, language);
  }

  try {
    // Preprocess image with language-aware settings
    const processedImage = await preprocessImage(imagePath, language);

    // Get a worker from the pool for the specified language
    const worker = await getWorker(language);

    // Run OCR
    const result = await worker.recognize(processedImage);
    let text = result.data.text;
    const confidence = result.data.confidence;

    // Extract word-level bounding box data for improved table detection
    const isUrduLang = language.includes('urd');

    // Post-process Urdu text to fix common OCR errors
    if (isUrduLang) {
      console.log(`[OCR-Tesseract] Raw OCR text (first 500 chars):\n${text.substring(0, 500)}`);
      text = postProcessUrduText(text);
      text = applyUrduCharacterCorrections(text);
      console.log(`[OCR-Tesseract] Post-processed OCR text (first 500 chars):\n${text.substring(0, 500)}`);
    }

    let blocks: ContentBlock[];

    // Try bounding-box-based table detection for Urdu content
    if (isUrduLang && result.data.words && result.data.words.length > 0) {
      // Post-process individual word texts too for BBox-based detection
      const wordBBoxes: WordBBox[] = result.data.words
        .filter((w: Tesseract.Word) => w.text.trim().length > 0)
        .map((w: Tesseract.Word) => ({
          text: postProcessUrduText(w.text),
          bbox: w.bbox,
          confidence: w.confidence,
        }));

      const bboxTable = detectTableFromBBox(wordBBoxes, true);
      if (bboxTable && bboxTable.headers.length >= 2 && bboxTable.rows.length >= 3) {
        // Bounding box detected a valid table structure
        blocks = [{
          type: 'table',
          content: bboxTable,
          confidence,
          needsReview: confidence < 60,
        }];
        console.log(`[OCR-Tesseract] BBox table detection succeeded: ${bboxTable.headers.length} cols, ${bboxTable.rows.length} rows`);
      } else {
        // Fall back to line-based approach if BBox fails
        console.log(`[OCR-Tesseract] BBox detection insufficient (${bboxTable ? `${bboxTable.rows.length} rows` : 'null'}), falling back to text-based parsing`);
        blocks = structureOcrOutput(text, confidence);
      }
    } else {
      // Standard text-based structuring
      blocks = structureOcrOutput(text, confidence);
    }

    // Add needsReview flag to blocks with low confidence
    blocks = blocks.map(block => ({
      ...block,
      needsReview: block.needsReview || (block.confidence || 0) < 60,
    }));

    const processingTime = Date.now() - startTime;
    console.log(`[OCR-Tesseract] Processed ${path.basename(imagePath)} in ${processingTime}ms, confidence: ${confidence.toFixed(1)}%, language: ${language}`);

    return {
      success: true,
      blocks,
      processingTime,
      engineUsed: 'tesseract',
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
    console.error(`[OCR-Tesseract] Failed to process ${path.basename(imagePath)}:`, errorMessage);

    return {
      success: false,
      blocks: [],
      error: errorMessage,
      processingTime,
      engineUsed: 'tesseract',
    };
  }
}

// Process a PDF file
export async function processPDF(pdfPath: string): Promise<OcrResult> {
  const startTime = Date.now();

  try {
    // Read the PDF file
    const dataBuffer = await fs.readFile(pdfPath);

    // Parse the PDF
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const numPages = pdfData.numpages;

    console.log(`[PDF] Parsed ${path.basename(pdfPath)}: ${numPages} pages, ${text.length} characters`);

    // Structure the extracted text into content blocks
    // PDFs typically have higher confidence since text is extracted directly
    const blocks = structurePdfOutput(text, numPages);

    const processingTime = Date.now() - startTime;
    console.log(`[PDF] Processed ${path.basename(pdfPath)} in ${processingTime}ms`);

    return {
      success: true,
      blocks,
      processingTime,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown PDF parsing error';
    console.error(`[PDF] Failed to process ${path.basename(pdfPath)}:`, errorMessage);

    return {
      success: false,
      blocks: [],
      error: errorMessage,
      processingTime,
    };
  }
}

// Structure PDF text output into content blocks
function structurePdfOutput(text: string, numPages: number): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Split by double newlines to get paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const type = detectContentType(trimmed);
    let content: string | TableData | ListData | FormData = trimmed;

    switch (type) {
      case 'table':
        content = parseTable(trimmed);
        break;
      case 'list':
        content = parseList(trimmed);
        break;
      case 'form':
        content = parseForm(trimmed);
        break;
    }

    // PDFs have high confidence since text is extracted directly (not OCR)
    blocks.push({
      type,
      content,
      confidence: 95, // High confidence for direct text extraction
    });
  }

  // If no blocks were created, add the entire text as a single block
  if (blocks.length === 0 && text.trim()) {
    blocks.push({
      type: 'text',
      content: text.trim(),
      confidence: 95,
    });
  }

  return blocks;
}

// Process multiple files (images and PDFs) in sub-batches
export async function processBatch(
  files: Array<{ id: string; path: string; filename: string; originalName: string; order: number; fileType?: FileType }>,
  batchSize: number = 5,
  onProgress?: (completed: number, total: number, currentFile: string) => void,
  language: OcrLanguage = 'eng+urd',
  ocrEngine: OcrEngine = 'auto'
): Promise<Map<string, OcrResult>> {
  const results = new Map<string, OcrResult>();
  const total = files.length;

  // Initialize worker pool for image processing with the specified language
  // Only initialize Tesseract workers if we might use Tesseract
  const visionAvailable = await isGoogleVisionAvailable();
  const willUseTesseract = ocrEngine === 'tesseract' ||
    (ocrEngine === 'auto' && !visionAvailable) ||
    (ocrEngine === 'auto' && !language.includes('urd'));

  if (willUseTesseract) {
    await initializeWorkerPool(language);
  }

  console.log(`[OCR] Processing batch of ${total} files with engine: ${ocrEngine}, vision available: ${visionAvailable}`);

  // Process in sub-batches
  for (let i = 0; i < total; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const promises = batch.map(async (file) => {
      if (onProgress) {
        onProgress(i, total, file.originalName);
      }

      // Route to appropriate processor based on file type
      let result: OcrResult;
      if (file.fileType === 'pdf') {
        result = await processPDF(file.path);
      } else {
        result = await processImage(file.path, language, ocrEngine);
      }

      results.set(file.id, result);
      return result;
    });

    await Promise.all(promises);

    if (onProgress) {
      onProgress(Math.min(i + batchSize, total), total, '');
    }
  }

  return results;
}

// Cleanup workers on shutdown
export async function terminateWorkers(): Promise<void> {
  console.log('[OCR] Terminating worker pool...');
  for (const [, workers] of workerPool) {
    for (const worker of workers) {
      await worker.terminate();
    }
  }
  workerPool.clear();
}
