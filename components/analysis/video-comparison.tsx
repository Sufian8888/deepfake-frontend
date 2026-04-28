"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Layers, SplitSquareHorizontal, Blend, Flame } from "lucide-react"

type ViewMode = "side-by-side" | "overlay" | "compare"

interface VideoComparisonProps {
  videoData?: any
  analysisData?: any
}

export function VideoComparison({ videoData, analysisData }: VideoComparisonProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side")
  const [isPlaying, setIsPlaying] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(55)

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const rawModelUrl = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:5000"
  const normalizedApiUrl = rawApiUrl.replace(/\/$/, "")
  const normalizedModelUrl = rawModelUrl.replace(/\/$/, "")

  const filename = videoData?.filename as string | undefined
  const normalizedPath = filename
    ? filename.startsWith("uploads/")
      ? `/${filename}`
      : `/uploads/${filename}`
    : null

  const videoSrc = normalizedPath ? `${normalizedApiUrl}${normalizedPath}` : null

  const annotatedFrames = analysisData?.analysis_details?.annotated_frames || []

  const heatmapSrc = useMemo(() => {
    if (!annotatedFrames.length) {
      return null
    }

    const firstFramePath = String(annotatedFrames[0]).replace(/\\/g, "/").replace(/^\/+/, "")
    const normalizedFramePath = firstFramePath
      .replace(/^model\/analysis_results\//, "")
      .replace(/^analysis_results\//, "")

    return `${normalizedModelUrl}/model/analysis_results/${normalizedFramePath}`
  }, [annotatedFrames, normalizedModelUrl])

  const togglePlay = () => setIsPlaying((prev) => !prev)

  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">Video Analysis</h2>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="glass">
            <TabsTrigger value="side-by-side" className="gap-2">
              <SplitSquareHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Side by Side</span>
            </TabsTrigger>
            <TabsTrigger value="overlay" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Overlay</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <Blend className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className={`grid gap-4 ${viewMode === "side-by-side" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-border/50">
          <div className="absolute inset-0 flex items-center justify-center">
            {videoSrc ? (
              <video src={videoSrc} className="w-full h-full object-contain" controls />
            ) : (
              <p className="text-muted-foreground">No video available</p>
            )}
          </div>
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg glass text-xs font-medium">Original</div>
        </div>

        {viewMode === "side-by-side" && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-primary/50 glow-blue">
            <div className="absolute inset-0 flex items-center justify-center">
              {heatmapSrc ? (
                <img src={heatmapSrc} alt="Annotated frame heatmap" className="w-full h-full object-contain" />
              ) : (
                <p className="text-muted-foreground">No annotated frame available</p>
              )}
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg glass text-xs font-medium text-primary flex items-center gap-1">
              <Flame className="h-3 w-3" /> Heatmap Overlay
            </div>
            <div className="absolute inset-0 shimmer pointer-events-none opacity-30" />
          </div>
        )}

        {viewMode === "overlay" && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-primary/40">
            <div className="absolute inset-0 flex items-center justify-center">
              {videoSrc ? (
                <video src={videoSrc} className="w-full h-full object-contain" controls />
              ) : (
                <p className="text-muted-foreground">No video available</p>
              )}
            </div>
            {heatmapSrc && (
              <img
                src={heatmapSrc}
                alt="Overlay heatmap"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ opacity: overlayOpacity / 100 }}
              />
            )}
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-white/90 mb-1">
                <span>Heatmap Opacity</span>
                <span>{overlayOpacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {viewMode === "compare" && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-primary/40">
            <div className="absolute inset-0 flex items-center justify-center">
              {videoSrc ? (
                <video src={videoSrc} className="w-full h-full object-contain" controls />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No video available</div>
              )}
            </div>

            {heatmapSrc && (
              <img
                src={heatmapSrc}
                alt="Compare heatmap"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ opacity: 0.35 }}
              />
            )}

            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg glass text-xs font-medium text-primary flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Compare View
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="outline" onClick={togglePlay} className="shrink-0">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1 h-2 rounded-full bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-primary rounded-full" />
            <div className="absolute top-0 bottom-0 left-[25%] w-1 bg-destructive" />
            <div className="absolute top-0 bottom-0 left-[45%] w-1 bg-destructive" />
            <div className="absolute top-0 bottom-0 left-[78%] w-1 bg-destructive" />
          </div>
          <span className="text-sm font-mono text-muted-foreground shrink-0">0:12 / 0:35</span>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            Detected anomaly
          </span>
        </div>
      </div>
    </div>
  )
}
