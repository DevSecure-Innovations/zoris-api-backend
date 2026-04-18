import type { 
	Request, 
	Response, 
    NextFunction,
} from 'express';
import * as secuityService from './security.service';

/* ROUTE: POST /webhook/url/check
 * DESC: Handle single url check
 */
export async function checkUrl( req: Request, res: Response, next: NextFunction ){
	try {
		if (!req.body?.url) return res.status(400).send('No data');

		const result = await secuityService.checkUrl(req.body.url);
		res.status(200).json({
            result
		});
	} catch (err) {
		next(err);
	}
}

/* ROUTE: POST /webhook/url/check
 * DESC: Handle single url check
 */
export async function checkUrlBatch( req: Request, res: Response, next: NextFunction ){
	try {
		if (!req.body?.urls) return res.status(400).send('No data');

		const result = await secuityService.checkUrlBatch(req.body.urls);
		res.status(200).json({
            result
		});
	} catch (err) {
		next(err);
	}
}
