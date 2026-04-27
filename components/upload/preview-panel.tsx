"use client"

import { Play, Pause, Clock, Monitor, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"

interface PreviewPanelProps {
  file: File | null
}

export function PreviewPanel({ file }: PreviewPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  // Create object URL when file changes
  if (file && !videoUrl) {
    setVideoUrl(URL.createObjectURL(file))
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 border border-border/50 h-full">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Monitor className="h-5 w-5 text-primary" />
        Preview
      </h2>

      {file && videoUrl ? (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full glow-blue" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Duration</span>
              </div>
              <p className="font-mono text-sm">--:--</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Monitor className="h-4 w-4" />
                <span className="text-xs">Resolution</span>
              </div>
              <p className="font-mono text-sm">1920x1080</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Film className="h-4 w-4" />
                <span className="text-xs">FPS</span>
              </div>
              <p className="font-mono text-sm">30</p>
            </div>
          </div>

          {/* Frame thumbnails */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Extracted Frames</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-20 h-14 rounded-lg bg-muted/30 border border-border/50 flex-shrink-0 shimmer"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-muted/20 border border-dashed border-border/50 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Film className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Upload a video to preview</p>
          </div>
        </div>
      )}
    </div>
  )
}
