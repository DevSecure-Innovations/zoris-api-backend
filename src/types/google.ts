import { z } from "zod";
import { gmail_v1 } from 'googleapis';

export const PubSubMessageSchema = z.object({
    data: z.string().optional(),
});

export const GmailWebhookBodySchema = z.object({
    message: PubSubMessageSchema.optional(),
});

export const StartAuthBodySchema = z.object({
    userId: z.string().optional(),
});

export const CallbackBodySchema = z.object({
    code: z.string().optional(),
    userId: z.string().optional(),
});

export const SafeBrowsingResponseSchema = z.object({
    matches: z.array(z.any()).optional(),
});

export const GeminiResponseSchema = z.object({
    candidates: z.array(
        z.object({
            content: z.object({
                parts: z.array(
                    z.object({
                        text: z.string(),
                    }).optional()
                ).optional(),
            }).optional(),
        }).optional()
	).optional(),
})

export type PubSubMessage = z.infer<typeof PubSubMessageSchema>;
export type GmailWebhookBody = z.infer<typeof GmailWebhookBodySchema>;
export type StartAuthBody = z.infer<typeof StartAuthBodySchema>;
export type CallbackBody = z.infer<typeof CallbackBodySchema>;
export type SafeBrowsingResponse = z.infer<typeof SafeBrowsingResponseSchema>;
export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;
export type GmailMessagePart = gmail_v1.Schema$MessagePart;
export type GmailMessagePartHeader = gmail_v1.Schema$MessagePartHeader;
export type GmailMessagePartBody = gmail_v1.Schema$MessagePartBody;
