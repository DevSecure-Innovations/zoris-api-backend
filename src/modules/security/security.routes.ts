import { Router } from 'express';
import bodyValidator from '../../middlewares/global.bodyValidator';
import { 
    CheckUrlSchema,
    CheckUrlBatchSchema,
} from '../../types/google';
import { checkUrl, checkUrlBatch } from './security.controller';

const router = Router();

/* ROUTE: /security/url/check
 * BODY: { url: string }
 */
router.post('/url/check', 
	bodyValidator(CheckUrlSchema),
	checkUrl
);

/* ROUTE: /security/url/check-batch
 * BODY: { urls: string [] }
 */
router.post('/url/check-batch', 
	bodyValidator(CheckUrlBatchSchema),
	checkUrlBatch
);

export default router;
