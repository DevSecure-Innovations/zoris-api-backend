import type { CallbackQuery } from "./auth";

declare global {
	namespace Express {
		interface Request {
			validated?: CallbackQuery
		}
	}
}
