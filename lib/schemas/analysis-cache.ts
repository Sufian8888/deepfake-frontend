import { z } from "zod"

export const cachedVideoSchema = z
  .object({
    id: z.number(),
    filename: z.string().optional(),
    original_filename: z.string().optional(),
    file_size: z.number().optional(),
    file_type: z.string().optional(),
    status: z.string(),
    is_deepfake: z.boolean().nullable().optional(),
    confidence_score: z.number().nullable().optional(),
    cloud_url: z.string().nullable().optional(),
    uploaded_at: z.string().optional(),
    processed_at: z.string().nullable().optional(),
  })
  .passthrough()

export const cachedAnalysisSchema = z
  .object({
    is_deepfake: z.boolean().nullable().optional(),
    confidence_score: z.number().nullable().optional(),
    analysis_details: z.record(z.any()).optional(),
    frame_analysis: z.record(z.any()).nullable().optional(),
    suggestions: z.array(z.string()).optional(),
  })
  .passthrough()

export type CachedVideo = z.infer<typeof cachedVideoSchema>
export type CachedAnalysis = z.infer<typeof cachedAnalysisSchema>

export const analysisCacheEntrySchema = z.object({
  video: cachedVideoSchema,
  analysis: cachedAnalysisSchema,
  fetchedAt: z.number(),
})

export type AnalysisCacheEntry = z.infer<typeof analysisCacheEntrySchema>
