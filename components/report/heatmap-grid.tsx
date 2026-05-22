import { VideoComparison } from "@/components/analysis/video-comparison"

interface HeatmapGridProps {
  analysisData?: any
  videoData?: any
}

export function HeatmapGrid({ analysisData, videoData }: HeatmapGridProps) {
  const annotatedFrames = analysisData?.analysis_details?.annotated_frames || []
  const frameDetails = analysisData?.analysis_details?.frame_analysis?.frame_details || []
  const previewFrames = annotatedFrames.slice(0, 8)
  const rawModelUrl = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:5000"
  const normalizedModelUrl = rawModelUrl.replace(/\/$/, "")

  const resolveAnnotatedFrameUrl = (framePath: string) => {
    const normalizedFramePath = String(framePath).replace(/\\/g, "/").replace(/^\/+/, "")
    const relativePath = normalizedFramePath
      .replace(/^model\/analysis_results\//, "")
      .replace(/^analysis_results\//, "")

    return `${normalizedModelUrl}/model/analysis_results/${relativePath}`
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-border/50">
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="text-lg font-semibold">Heatmap Evidence</h3>
          <p className="text-sm text-muted-foreground">
            The large panel below is the model heatmap view. It shows where the network focused, and the gallery below shows the same analysis on individual frames.
          </p>
        </div>

        <VideoComparison videoData={videoData} analysisData={analysisData} size="large" />
      </div>

      {previewFrames.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-4">Annotated Frame Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewFrames.map((framePath: string, index: number) => {
              const frameMeta = frameDetails[index] || {}
              const frameLabel = frameMeta.label || (frameMeta.is_suspicious ? "FAKE" : "REAL")

              return (
                <div key={index} className="relative rounded-xl overflow-hidden border border-border/50 bg-black/40 shadow-lg">
                  <img
                    src={resolveAnnotatedFrameUrl(framePath)}
                    alt={`Annotated frame ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-[11px] text-white font-medium">
                    Frame {frameMeta.frame_num ?? index + 1}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 text-[11px] text-white">
                    <span className="px-2 py-1 rounded bg-black/70">{frameLabel}</span>
                    {typeof frameMeta.confidence === "number" && (
                      <span className="px-2 py-1 rounded bg-black/70 font-mono">
                        {frameMeta.confidence.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
