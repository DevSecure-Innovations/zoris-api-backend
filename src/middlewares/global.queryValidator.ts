import type {
	Response, 
	Request, 
	NextFunction
} from 'express';
import { ZodType } from 'zod';

/* DESC: Middleware to validate query params 
 * PARAMS: a zod schema
 */
const queryValidator = <T>(schema: ZodType<T>) => 
	(req: Request, res: Response, next: NextFunction) => {
		const parsed = schema.safeParse(req.query);

		if (!parsed.success) {
			return res.status(400).json({
				error: parsed.error.issues.map((err) => ({
					path: err.path.join("."),
					message: err.message,
				})),
			});    
		}
		next();
	}

export default queryValidator;


