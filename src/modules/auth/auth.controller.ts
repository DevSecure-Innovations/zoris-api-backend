import type { 
	Request, 
	Response, 
	NextFunction
} from 'express';
import * as authService from './auth.service';

/* ROUTE: POST /api/auth/gmail
 * DESC: Start the OAuth flow
 */
export async function startAuth( req: Request, res: Response, next: NextFunction ){
	try {
		console.log('req.body', req.body);
		console.log('req.body.userId', req.body.userId);
		const authUrl = await authService.startAuth(req.body);
		res.json({ authUrl });
	} catch (err) {
		next(err);
	}
}

/* ROUTE: POST /api/auth/gmail/callback
 * DESC: Finish the OAuth flow
 */
export async function handleGetCallback( req: Request, res: Response, next: NextFunction ){
	try {
		await authService.handleGetCallback(req.validated!);
		res.json({ 
			success: true, 
			message: 'Gmail connected & monitoring started' 
		});
	} catch (err) {
		next(err);
	}
}

/* ROUTE: POST /api/auth/gmail/callback
 * DESC: Finish the OAuth flow
 */
export async function handleCallback( req: Request, res: Response, next: NextFunction ){
	try {
		await authService.handleCallback(req.body);
		res.json({ 
			success: true, 
			message: 'Gmail connected & monitoring started' 
		});
	} catch (err) {
		next(err);
	}
}
