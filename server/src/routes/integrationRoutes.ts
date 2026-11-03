import { Router } from 'express';
import { submitIntegration } from '../controllers/integrationController';

const router = Router();

router.post('/', submitIntegration);

export default router;
