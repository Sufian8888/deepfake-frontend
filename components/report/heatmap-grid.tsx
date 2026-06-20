import { VideoComparison } from "@/components/analysis/video-comparison"
import {
  buildHeatmapPreviewItems,
  getFrameAnalysis,
  getFrameConfidence,
  getFrameDetails,
  getFrameLabel,
  getFrameNumber,
} from "@/lib/frame-analysis"

interface HeatmapGridProps {
  analysisData?: any
  videoData?: any
}

export function HeatmapGrid({ analysisData, videoData }: HeatmapGridProps) {
  const frameAnalysis = getFrameAnalysis(analysisData)
  const frameDetails = getFrameDetails(analysisData)
  const previewItems = buildHeatmapPreviewItems(analysisData, 8)
  const visiblePreviewItems = previewItems.filter((item) => Boolean(item.src))
  const suspiciousFrames = frameDetails.filter(
    (frame: any) => frame?.is_suspicious || frame?.is_fake || frame?.label === "FAKE"
  )

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-border/50 shadow-2xl shadow-primary/10">
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold">Heatmap Evidence</h3>
              <p className="text-sm text-muted-foreground max-w-3xl">
                This section mirrors the local attention view: a large comparison panel on top and a frame-by-frame heatmap strip below.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {visiblePreviewItems.length} highlighted frames
              </span>
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                {suspiciousFrames.length || frameAnalysis.suspicious_frames || 0} suspicious peaks
              </span>
            </div>
          </div>
        </div>

        <VideoComparison videoData={videoData} analysisData={analysisData} size="large" />
      </div>

      {visiblePreviewItems.length > 0 ? (
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Frame Heatmap Strip</h3>
              <p className="text-sm text-muted-foreground">
                Individual annotated frames with the model confidence and suspicion markers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {visiblePreviewItems.map((item, index) => {
              const frameLabel = getFrameLabel(item.frame)
              const confidence = getFrameConfidence(item.frame)

              return (
                <div
                  key={item.key}
                  className="relative rounded-xl overflow-hidden border border-border/50 bg-black/40 shadow-lg ring-1 ring-primary/10"
                >
                  <img
                    src={item.src!}
                    alt={`Annotated frame ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-[11px] text-white font-medium">
                    Frame {getFrameNumber(item.frame, index)}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 text-[11px] text-white">
                    <span className="px-2 py-1 rounded bg-black/70">{frameLabel}</span>
                    {confidence !== null && (
                      <span className="px-2 py-1 rounded bg-black/70 font-mono">
                        {confidence.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-2">Frame Heatmap Strip</h3>
          <p className="text-sm text-muted-foreground">
            No frame heatmaps are available for this analysis yet. Re-run analysis after the model service is online to populate frame evidence.
          </p>
        </div>
      )}
    </div>
  )
}
