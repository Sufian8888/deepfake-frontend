import { create } from "zustand"
import { predictionsAPI, uploadAPI } from "@/lib/api"
import {
  analysisCacheEntrySchema,
  cachedAnalysisSchema,
  cachedVideoSchema,
  type AnalysisCacheEntry,
  type CachedAnalysis,
  type CachedVideo,
} from "@/lib/schemas/analysis-cache"

const CACHE_TTL_MS = 5 * 60 * 1000

type AnalysisCacheState = {
  entries: Record<number, AnalysisCacheEntry>
  loadingIds: Record<number, boolean>
  getEntry: (videoId: number) => AnalysisCacheEntry | null
  isFresh: (videoId: number) => boolean
  prefetchVideo: (videoId: number, options?: { force?: boolean }) => Promise<AnalysisCacheEntry | null>
  prefetchCompletedVideos: (videos: Array<{ id: number; status: string }>) => void
  invalidateVideo: (videoId: number) => void
}

function isCacheFresh(entry: AnalysisCacheEntry | undefined) {
  if (!entry) return false
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS
}

async function fetchAndValidate(videoId: number): Promise<AnalysisCacheEntry | null> {
  const [videoRaw, analysisRaw] = await Promise.all([
    uploadAPI.getFile(videoId),
    predictionsAPI.getResult(videoId),
  ])

  const video = cachedVideoSchema.parse(videoRaw) as CachedVideo
  const analysis = cachedAnalysisSchema.parse(analysisRaw) as CachedAnalysis

  return analysisCacheEntrySchema.parse({
    video,
    analysis,
    fetchedAt: Date.now(),
  })
}

export const useAnalysisCache = create<AnalysisCacheState>((set, get) => ({
  entries: {},
  loadingIds: {},

  getEntry(videoId) {
    const entry = get().entries[videoId]
    return isCacheFresh(entry) ? entry : null
  },

  isFresh(videoId) {
    return isCacheFresh(get().entries[videoId])
  },

  async prefetchVideo(videoId, options) {
    const existing = get().entries[videoId]
    if (!options?.force && isCacheFresh(existing)) {
      return existing
    }

    if (get().loadingIds[videoId]) {
      return existing ?? null
    }

    set((state) => ({
      loadingIds: { ...state.loadingIds, [videoId]: true },
    }))

    try {
      const entry = await fetchAndValidate(videoId)
      if (!entry) return null

      set((state) => ({
        entries: { ...state.entries, [videoId]: entry },
      }))

      return entry
    } catch (error) {
      console.warn(`Failed to prefetch analysis for video ${videoId}:`, error)
      return null
    } finally {
      set((state) => {
        const nextLoading = { ...state.loadingIds }
        delete nextLoading[videoId]
        return { loadingIds: nextLoading }
      })
    }
  },

  prefetchCompletedVideos(videos) {
    const completedIds = videos
      .filter((video) => video.status === "completed")
      .map((video) => video.id)

    completedIds.forEach((videoId) => {
      if (!get().isFresh(videoId) && !get().loadingIds[videoId]) {
        void get().prefetchVideo(videoId)
      }
    })
  },

  invalidateVideo(videoId) {
    set((state) => {
      const nextEntries = { ...state.entries }
      delete nextEntries[videoId]
      return { entries: nextEntries }
    })
  },
}))
