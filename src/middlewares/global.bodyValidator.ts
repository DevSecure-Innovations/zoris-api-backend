import type {
	Response, 
	Request, 
	NextFunction
} from 'express';
import { ZodType } from 'zod';

/* DESC: Middleware to validate body params 
 * PARAMS: a zod schema
 */
const bodyValidator = <T>(schema: ZodType<T>) => 
	(req: Request<{}, {}, T>, res: Response, next: NextFunction) => {
		const parsed = schema.safeParse(req.body);

		if (!parsed.success) {
			return res.status(400).json({
				error: parsed.error.issues.map((err) => ({
					path: err.path.join("."),
					message: err.message,
				})),
			});    
		}
		req.body = parsed.data;
		next();
	}

export default bodyValidator;
