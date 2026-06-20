'use client'

import { useEffect, useState } from 'react'
import { predictionsAPI } from '@/lib/api'
import { applyThumbnailsToAnalysis } from '@/lib/frame-analysis'

type ThumbnailMap = Record<number, string>

export function useFrameThumbnails(videoId?: number, analysisData?: any) {
  const [thumbnails, setThumbnails] = useState<ThumbnailMap>({})
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false)

  useEffect(() => {
    if (!videoId) {
      setThumbnails({})
      return
    }

    let cancelled = false

    const loadThumbnails = async () => {
      setIsLoadingThumbnails(true)

      try {
        const response = await predictionsAPI.getFrameThumbnails(videoId, 0, 50)
        if (cancelled) return

        const next: ThumbnailMap = {}
        for (const item of response?.items || []) {
          if (item?.thumbnail_base64) {
            next[item.frame_number] = item.thumbnail_base64
          }
        }
        setThumbnails(next)
      } catch (error) {
        if (!cancelled) {
          console.warn('Failed to load frame thumbnails:', error)
          setThumbnails({})
        }
      } finally {
        if (!cancelled) {
          setIsLoadingThumbnails(false)
        }
      }
    }

    loadThumbnails()

    return () => {
      cancelled = true
    }
  }, [videoId])

  const enrichedAnalysisData = analysisData
    ? applyThumbnailsToAnalysis(analysisData, thumbnails)
    : analysisData

  return {
    thumbnails,
    isLoadingThumbnails,
    enrichedAnalysisData,
  }
}
