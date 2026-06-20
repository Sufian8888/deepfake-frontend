export function getFrameAnalysis(analysisData?: any) {
  if (!analysisData) return {}

  return (
    analysisData.frame_analysis ||
    analysisData.analysis_details?.frame_analysis ||
    analysisData.analysis_details?.report_summary?.frame_breakdown ||
    analysisData.report_summary?.frame_breakdown ||
    {}
  )
}

export function getFrameDetails(analysisData?: any) {
  const frameAnalysis = getFrameAnalysis(analysisData)
  return Array.isArray(frameAnalysis.frame_details) ? frameAnalysis.frame_details : []
}

export function getAnnotatedFramePaths(analysisData?: any) {
  const paths = analysisData?.analysis_details?.annotated_frames
  return Array.isArray(paths) ? paths : []
}

export function toBase64ImageSrc(value?: string | null) {
  if (!value) return null
  if (value.startsWith("data:")) return value
  return `data:image/jpeg;base64,${value}`
}

export function resolveModelFrameUrl(framePath: string, modelUrl: string) {
  const normalizedFramePath = String(framePath).replace(/\\/g, "/").replace(/^\/+/, "")
  const relativePath = normalizedFramePath
    .replace(/^model\/analysis_results\//, "")
    .replace(/^analysis_results\//, "")

  return `${modelUrl.replace(/\/$/, "")}/model/analysis_results/${relativePath}`
}

export function resolveFrameImageSrc(
  frame: any,
  options?: { annotatedPath?: string; modelUrl?: string }
) {
  const thumbnail = toBase64ImageSrc(frame?.thumbnail_base64)
  if (thumbnail) return thumbnail

  const image = toBase64ImageSrc(frame?.image_base64)
  if (image) return image

  if (options?.annotatedPath && options?.modelUrl) {
    return resolveModelFrameUrl(options.annotatedPath, options.modelUrl)
  }

  return null
}

export function getFrameLabel(frame: any) {
  if (frame?.label) return frame.label
  if (frame?.is_fake || frame?.is_suspicious) return "FAKE"
  return "REAL"
}

export function getFrameConfidence(frame: any) {
  const value = frame?.confidence_score ?? frame?.confidence
  return typeof value === "number" ? value : null
}

export function getFrameNumber(frame: any, fallbackIndex: number) {
  return frame?.frame_number ?? frame?.frame_num ?? fallbackIndex + 1
}

export function applyThumbnailsToAnalysis(analysisData: any, thumbnails: Record<number, string>) {
  if (!analysisData || Object.keys(thumbnails).length === 0) {
    return analysisData
  }

  const frameAnalysis = getFrameAnalysis(analysisData)
  const frameDetails = Array.isArray(frameAnalysis.frame_details) ? frameAnalysis.frame_details : []
  if (frameDetails.length === 0) {
    return analysisData
  }

  const enrichedDetails = frameDetails.map((frame: any, index: number) => {
    const frameNumber = getFrameNumber(frame, index)
    const thumbnail = thumbnails[frameNumber]
    if (!thumbnail) {
      return frame
    }

    return {
      ...frame,
      thumbnail_base64: thumbnail,
    }
  })

  const nextFrameAnalysis = {
    ...frameAnalysis,
    frame_details: enrichedDetails,
  }

  if (analysisData.frame_analysis) {
    return {
      ...analysisData,
      frame_analysis: nextFrameAnalysis,
    }
  }

  if (analysisData.analysis_details?.frame_analysis) {
    return {
      ...analysisData,
      analysis_details: {
        ...analysisData.analysis_details,
        frame_analysis: nextFrameAnalysis,
      },
    }
  }

  return {
    ...analysisData,
    frame_analysis: nextFrameAnalysis,
  }
}

export function buildHeatmapPreviewItems(analysisData?: any, limit = 8) {
  const frameDetails = getFrameDetails(analysisData)
  const annotatedPaths = getAnnotatedFramePaths(analysisData)
  const modelUrl = (process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:5000").replace(/\/$/, "")

  if (frameDetails.length > 0) {
    return frameDetails.slice(0, limit).map((frame: any, index: number) => ({
      key: `frame-${getFrameNumber(frame, index)}`,
      src: resolveFrameImageSrc(frame, {
        annotatedPath: annotatedPaths[index],
        modelUrl,
      }),
      frame,
    }))
  }

  return annotatedPaths.slice(0, limit).map((path: string, index: number) => ({
    key: `annotated-${index}`,
    src: resolveModelFrameUrl(path, modelUrl),
    frame: { frame_number: index + 1 },
  }))
}
