"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Layers, SplitSquareHorizontal, Blend } from "lucide-react"

type ViewMode = "side-by-side" | "overlay" | "compare"

interface VideoComparisonProps {
  videoData?: any
}

export function VideoComparison({ videoData }: VideoComparisonProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side")
  const [isPlaying, setIsPlaying] = useState(false)
  
  const videoSrc = videoData?.filename ? `http://localhost:8000/${videoData.filename}` : null

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
              <video src={videoSrc} className="w-full h-full object-cover" controls />
            ) : (
              <p className="text-muted-foreground">No video available</p>
            )}
          </div>
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg glass text-xs font-medium">Original</div>
        </div>

        {viewMode === "side-by-side" && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-primary/50 glow-blue">
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/heatmap-overlay-face-detection-red-orange-thermal.jpg" alt="Heatmap analysis" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg glass text-xs font-medium text-primary">
              Heatmap Overlay
            </div>
            <div className="absolute inset-0 shimmer pointer-events-none opacity-30" />
          </div>
        )}

        {viewMode === "overlay" && (
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/30 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Timeline scrubber */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="shrink-0">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1 h-2 rounded-full bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-primary rounded-full" />
            {/* Anomaly markers */}
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
