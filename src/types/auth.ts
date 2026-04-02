import { z } from "zod";

export const StartAuthBodySchema = z.object({
    userId: z.string().optional(),
});

export const CallbackBodySchema = z.object({
    code: z.string().optional(),
    userId: z.string().optional(),
});

export type StartAuthBody = z.infer<typeof StartAuthBodySchema>;
export type CallbackBody = z.infer<typeof CallbackBodySchema>;
