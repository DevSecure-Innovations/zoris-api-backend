import { z } from "zod";
import { gmail_v1 } from 'googleapis';

export const ThreatTypeEnum = z.enum([
	"MALWARE",
	"SOCIAL_ENGINEERING",
	"UNWANTED_SOFTWARE",
	"POTENTIALLY_HARMFUL_APPLICATION",
]);

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

export const SafeBrowsingMatchSchema = z.object({
	threatType: ThreatTypeEnum,
	threat: z.object({
		url: z.string().url(),
	}),
});

export const SafeBrowsingResponseSchema = z.object({
	matches: z.array(SafeBrowsingMatchSchema).optional(),
});

export const CheckUrlSchema = z.object({
    url: z.string(),
});

export const CheckUrlBatchSchema = z.object({
	urls: z.array(z.string()),
});

export type ThreatType = z.infer<typeof ThreatTypeEnum>;
export type PubSubMessage = z.infer<typeof PubSubMessageSchema>;
export type GmailWebhookBody = z.infer<typeof GmailWebhookBodySchema>;
export type StartAuthBody = z.infer<typeof StartAuthBodySchema>;
export type CallbackBody = z.infer<typeof CallbackBodySchema>;
export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;
export type GmailMessagePart = gmail_v1.Schema$MessagePart;
export type GmailMessagePartHeader = gmail_v1.Schema$MessagePartHeader;
export type GmailMessagePartBody = gmail_v1.Schema$MessagePartBody;
export type SafeBrowsingMatch = z.infer<typeof SafeBrowsingMatchSchema>;
export type SafeBrowsingResponse = z.infer<typeof SafeBrowsingResponseSchema>;
export type CheckUrl = z.infer<typeof CheckUrlSchema>;
export type CheckUrlBatch = z.infer<typeof CheckUrlBatchSchema>;
