import { Router } from 'express';
import { GmailWebhookBodySchema } from '../../types/google';
import { gmailWebhook } from './webhook.controller';
import bodyValidator from '../../middlewares/global.bodyValidator';

const router = Router();

/* ROUTE: /webhook/gmail
 * BODY: { message: { data: string } }
 */
router.post('/gmail', 
	bodyValidator(GmailWebhookBodySchema),
	gmailWebhook
);

export default router;
