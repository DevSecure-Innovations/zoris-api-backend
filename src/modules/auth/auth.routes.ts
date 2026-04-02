import { Router } from 'express';
import { 
	StartAuthBodySchema, 
    CallbackBodySchema, 
} from '../../types/auth';
import bodyValidator from '../../middlewares/global.bodyValidator';
import { 
	startAuth, 
	handleCallback 
} from './auth.controller';

const router = Router();

/* ROUTE: /api/auth/gmail
 * BODY: { userId: string }
 */
router.post("/gmail", 
    bodyValidator(StartAuthBodySchema),
	startAuth
);

/* ROUTE: /api/auth/gmail/callback
 * BODY: { code: string, userId: string }
 */
router.post("/gmail/callback",
    bodyValidator(CallbackBodySchema),
	handleCallback
);

export default router;
