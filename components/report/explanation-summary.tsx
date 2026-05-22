import { Brain, Lightbulb } from "lucide-react"

interface ExplanationSummaryProps {
  analysisData?: any
}

export function ExplanationSummary({ analysisData }: ExplanationSummaryProps) {
  const reportSummary = analysisData?.report_summary || analysisData?.analysis_details?.report_summary || {}
  const finalLabel = reportSummary.final_label || (analysisData?.is_deepfake ? "FAKE" : "REAL")
  const avgProbFake = typeof reportSummary.avg_prob_fake === "number" ? reportSummary.avg_prob_fake : null

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
          {finalLabel === "FAKE"
            ? "The analyzed video exhibits multiple indicators of synthetic manipulation consistent with deepfake generation techniques. The model flagged several frames as suspicious and the overlay heatmaps highlight regions the model relied on most."
            : "The analyzed video does not show strong manipulation signals in the model summary. The model produced a real verdict with no dominant deepfake pattern in the sampled frames."}
        </p>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium mb-1">Key Insight</p>
              <p className="text-sm text-muted-foreground">
                {avgProbFake !== null
                  ? `Average fake probability across sampled frames is ${(avgProbFake * 100).toFixed(1)}%, which matches the final report summary.`
                  : "The report summary is based on the model output and annotated frame evidence from the backend."}
              </p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {finalLabel === "FAKE"
            ? "Additionally, the sampled frames and attention overlays indicate repeated model focus on regions associated with manipulation."
            : "Additionally, the sampled frames remain consistent with the model's real verdict and do not show a dominant anomaly pattern."}
        </p>
      </div>
    </div>
  )
}
