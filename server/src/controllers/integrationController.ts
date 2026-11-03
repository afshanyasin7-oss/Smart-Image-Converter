import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTEGRATIONS_FILE = path.resolve(__dirname, '../../integrations.json');

interface IntegrationSubmission {
  id: string;
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  integrationType: string;
  websiteUrl?: string;
  description: string;
  expectedVolume: string;
  submittedAt: string;
}

function readSubmissions(): IntegrationSubmission[] {
  try {
    if (fs.existsSync(INTEGRATIONS_FILE)) {
      const raw = fs.readFileSync(INTEGRATIONS_FILE, 'utf-8');
      return JSON.parse(raw) as IntegrationSubmission[];
    }
  } catch (err) {
    console.error('[INTEGRATION] Failed to read integrations file:', err);
  }
  return [];
}

function writeSubmissions(submissions: IntegrationSubmission[]): void {
  fs.writeFileSync(INTEGRATIONS_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
}

export async function submitIntegration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      fullName,
      companyName,
      email,
      phone,
      integrationType,
      websiteUrl,
      description,
      expectedVolume,
    } = req.body;

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      errors.fullName = 'Full name is required';
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'A valid email address is required';
    }

    if (!integrationType || typeof integrationType !== 'string' || integrationType.trim().length === 0) {
      errors.integrationType = 'Integration type is required';
    }

    if (!description || typeof description !== 'string' || description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }

    if (!expectedVolume || typeof expectedVolume !== 'string' || expectedVolume.trim().length === 0) {
      errors.expectedVolume = 'Expected monthly volume is required';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, error: 'Validation failed', errors, statusCode: 400 });
      return;
    }

    const submission: IntegrationSubmission = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      companyName: companyName?.trim() || undefined,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      integrationType: integrationType.trim(),
      websiteUrl: websiteUrl?.trim() || undefined,
      description: description.trim(),
      expectedVolume: expectedVolume.trim(),
      submittedAt: new Date().toISOString(),
    };

    const submissions = readSubmissions();
    submissions.push(submission);
    writeSubmissions(submissions);

    console.log(`[INTEGRATION] New submission from ${submission.email} (${submission.integrationType})`);

    res.status(201).json({
      success: true,
      data: { id: submission.id, message: 'Integration request submitted successfully' },
    });
  } catch (err) {
    next(err);
  }
}
