import { XCircle, AlertTriangle, CheckCircle } from "lucide-react"

interface VerdictCardProps {
  finalLabel?: string | null
  finalConfidence?: number | null
  avgProbFake?: number | null
  fallbackIsDeepfake?: boolean
}

export function VerdictCard({
  finalLabel,
  finalConfidence,
  avgProbFake,
  fallbackIsDeepfake = false,
}: VerdictCardProps) {
  const verdict = (finalLabel || (fallbackIsDeepfake ? "FAKE" : "REAL")).toUpperCase()
  const isFake = verdict === "FAKE"
  const isSuspicious = verdict === "SUSPICIOUS"
  const verdictColor = isFake ? "text-destructive" : isSuspicious ? "text-yellow-500" : "text-green-500"
  const verdictBg = isFake ? "bg-destructive/10" : isSuspicious ? "bg-yellow-500/10" : "bg-green-500/10"
  const Icon = isFake ? XCircle : isSuspicious ? AlertTriangle : CheckCircle
  const displayConfidence = Math.round(finalConfidence ?? 0)
  const displayAvgProbFake = typeof avgProbFake === "number" ? avgProbFake : null

  return (
    <div className={`glass rounded-2xl p-8 border border-border/50 ${verdictBg}`}>
      <div className="text-center">
        <Icon className={`h-20 w-20 mx-auto mb-4 ${verdictColor}`} />
        <p className="text-sm text-muted-foreground mb-2">Final Verdict</p>
        <h2 className={`text-4xl font-bold mb-4 ${verdictColor}`}>{verdict}</h2>
        <div className="flex items-center justify-center gap-8">
          <div>
            <p className="text-3xl font-bold font-mono">{displayConfidence}%</p>
            <p className="text-xs text-muted-foreground">Final Confidence</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="text-3xl font-bold font-mono">{displayAvgProbFake !== null ? `${(displayAvgProbFake * 100).toFixed(1)}%` : "-"}</p>
            <p className="text-xs text-muted-foreground">Avg prob_fake</p>
          </div>
        </div>
      </div>
    </div>
  )
}
