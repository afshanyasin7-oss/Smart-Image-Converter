import express from 'express';
import { extractContent } from '../controllers/extractController';

const router = express.Router();

// POST /api/extract - Extract content from uploaded images
router.post('/', extractContent);

export default router;
