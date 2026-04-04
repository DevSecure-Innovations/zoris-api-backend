import { Router } from 'express';
import { 
	StartAuthBodySchema, 
    CallbackBodySchema,
    CallbackQuerySchema, 
} from '../../types/auth';
import queryValidator from '../../middlewares/global.queryValidator';
import bodyValidator from '../../middlewares/global.bodyValidator';
import { 
	startAuth, 
	handleCallback,
	handleGetCallback
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
 * QUERY: { state: string, code: string }
 */
router.get("/gmail/callback",
    queryValidator(CallbackQuerySchema),
	handleGetCallback
);

/* ROUTE: /api/auth/gmail/callback
 * BODY: { code: string, userId: string }
 */
router.post("/gmail/callback",
    bodyValidator(CallbackBodySchema),
	handleCallback
);

export default router;
