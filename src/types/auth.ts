import { z } from "zod";

export const StartAuthBodySchema = z.object({
    userId: z.string(),
});

export const CallbackBodySchema = z.object({
    code: z.string(),
    userId: z.string(),
});

export type StartAuthBody = z.infer<typeof StartAuthBodySchema>;
export type CallbackBody = z.infer<typeof CallbackBodySchema>;
