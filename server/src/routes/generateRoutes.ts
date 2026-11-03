import express from 'express';
import { generateExcelFile, generateWordFile } from '../controllers/generateController';

const router = express.Router();

// POST /api/generate/excel - Generate Excel file
router.post('/excel', generateExcelFile);

// POST /api/generate/word - Generate Word file
router.post('/word', generateWordFile);

export default router;
