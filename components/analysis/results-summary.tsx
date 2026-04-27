import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ResultsSummaryProps {
  analysisData: any
  videoId: string | null
}

export function ResultsSummary({ analysisData, videoId }: ResultsSummaryProps) {
  if (!analysisData) {
    return (
      <div className="glass rounded-2xl p-6 border border-border/50">
        <p className="text-muted-foreground text-center">No analysis data available</p>
      </div>
    )
  }

  const overallScore = Math.round(analysisData.confidence_score || 0)
  const isDeepfake = analysisData.is_deepfake
  const verdict = isDeepfake ? "LIKELY FAKE" : "LIKELY REAL"
  const verdictColor = isDeepfake ? "text-destructive" : "text-green-500"
  const verdictBg = isDeepfake ? "bg-destructive/20" : "bg-green-500/20"

  const details = analysisData.analysis_details || {}
  const keyFindings = []

  // Generate findings from analysis details
  if (details.facial_consistency !== undefined) {
    const severity = details.facial_consistency < 50 ? "high" : details.facial_consistency < 70 ? "medium" : "low"
    keyFindings.push({
      label: `Facial consistency: ${details.facial_consistency?.toFixed(1)}%`,
      severity
    })
  }

  if (details.audio_sync !== undefined) {
    const severity = details.audio_sync < 50 ? "high" : details.audio_sync < 70 ? "medium" : "low"
    keyFindings.push({
      label: `Audio-visual sync: ${details.audio_sync?.toFixed(1)}%`,
      severity
    })
  }

  if (details.artifacts_detected) {
    keyFindings.push({
      label: "Visual artifacts detected",
      severity: "high"
    })
  }

  if (details.frame_analysis) {
    const { total_frames, suspicious_frames } = details.frame_analysis
    if (suspicious_frames > 0) {
      keyFindings.push({
        label: `${suspicious_frames} of ${total_frames} frames flagged`,
        severity: suspicious_frames > total_frames * 0.5 ? "high" : "medium"
      })
    }
  }

  // Add suggestions as findings if available
  if (analysisData.suggestions && analysisData.suggestions.length > 0) {
    keyFindings.push(...analysisData.suggestions.slice(0, 2).map((s: string) => ({
      label: s.replace(/[⚠️🔍📊🚨✅💡📈✔️]/g, '').trim(),
      severity: isDeepfake ? "high" : "low"
    })))
  }

  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <h2 className="text-xl font-semibold mb-6">Analysis Summary</h2>

      <div className={`rounded-xl p-6 ${verdictBg} mb-6`}>
        <div className="flex items-center gap-4">
          {isDeepfake ? (
            <XCircle className="h-12 w-12 text-destructive" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Verification Result</p>
            <p className={`text-2xl font-bold ${verdictColor}`}>{verdict}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-muted-foreground mb-1">Confidence</p>
            <p className={`text-3xl font-bold font-mono ${verdictColor}`}>{overallScore}%</p>
          </div>
        </div>
      </div>

      {keyFindings.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="font-medium">Key Findings</h3>
          <div className="space-y-2">
            {keyFindings.map((finding, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div
                  className={`w-2 h-2 rounded-full ${
                    finding.severity === "high"
                      ? "bg-destructive"
                      : finding.severity === "medium"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                />
                <span className="text-sm">{finding.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* <Link href={`/report?videoId=${videoId}`}>
        <Button className="w-full glow-blue">
          View Full Report
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link> */}
    </div>
  )
}
