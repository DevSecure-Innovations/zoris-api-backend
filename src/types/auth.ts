import { z } from "zod";

export const StartAuthBodySchema = z.object({
    userId: z.string(),
});

export const CallbackQuerySchema = z.object({
	state: z.string(),
    code: z.string(),
	iss: z.string(),
	scope: z.string(),
})

export const CallbackBodySchema = z.object({
    code: z.string(),
    userId: z.string(),
});

export type StartAuthBody = z.infer<typeof StartAuthBodySchema>;
export type CallbackBody = z.infer<typeof CallbackBodySchema>;
export type CallbackQuery = z.infer<typeof CallbackQuerySchema>;
