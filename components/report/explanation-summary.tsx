import { Brain, Lightbulb } from "lucide-react"

export function ExplanationSummary() {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">AI Explanation Summary</h3>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          The analyzed video exhibits multiple indicators of synthetic manipulation consistent with deepfake generation
          techniques. The primary evidence includes significant audio-visual desynchronization, particularly during
          speech segments between 0:09-0:15 and 0:30-0:33.
        </p>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium mb-1">Key Insight</p>
              <p className="text-sm text-muted-foreground">
                The facial boundary analysis revealed characteristic blending artifacts that occur when a face-swap
                algorithm attempts to merge synthetic facial features with the original head pose and lighting
                conditions. These artifacts are particularly visible around the jawline and hairline regions.
              </p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Additionally, temporal analysis detected optical flow inconsistencies suggesting frame interpolation or
          manipulation. The compression analysis revealed unusual JPEG grid alignment patterns that may indicate
          post-processing or re-encoding of the manipulated content.
        </p>
      </div>
    </div>
  )
}
