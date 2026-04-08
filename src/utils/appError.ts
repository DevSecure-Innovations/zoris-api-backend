/* DESC: Custom error class for global error handling
 * PARAMS: message: string, statusCode: number
 * USAGE: throw new AppError('Error message', 500)
 * TODO: add more error types
 */
export default class AppError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;

		Error.captureStackTrace(this, this.constructor);
	}
}
