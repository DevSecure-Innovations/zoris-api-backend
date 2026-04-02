import { z } from 'zod';

export const userTokenSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiryDate: z.number().optional(),
})

export type UserTokens = z.infer<typeof userTokenSchema>;
