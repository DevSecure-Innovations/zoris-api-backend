import type { 
	Request, 
	Response, 
    NextFunction,
} from 'express';
import * as webhookService from './webhook.service';

/* ROUTE: POST /webhook/gmail
 * DESC: Handle Gmail webhook
 */
export async function gmailWebhook( req: Request, res: Response, next: NextFunction ){
	try {
		const message = req.body.message;
		if (!message?.data) return res.status(400).send('No data');

		await webhookService.gmailWebhook(message);
		res.status(200).send('OK');
	} catch (err) {
		next(err);
	}
}
