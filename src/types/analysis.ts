import { z } from 'zod';

export const AnalysisResultSchema = z.object({
    isMalicious: z.boolean(),
    riskScore: z.number(),
    reasons: z.array(z.string()),
})

export const AdvancedAnalysisSchema = z.object({
    isMalicious: z.boolean(),
    riskScore: z.number(),
    reasons: z.array(z.string()),
    sources: z.array(z.string()),
})

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AdvancedAnalysis = z.infer<typeof AdvancedAnalysisSchema>;
