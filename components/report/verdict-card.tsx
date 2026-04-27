import { XCircle, AlertTriangle, CheckCircle } from "lucide-react"

interface VerdictCardProps {
  score: number
  confidence: number
}

export function VerdictCard({ score = 73, confidence = 89 }: VerdictCardProps) {
  const verdict = score > 70 ? "FAKE" : score > 40 ? "SUSPICIOUS" : "REAL"
  const verdictColor = score > 70 ? "text-destructive" : score > 40 ? "text-yellow-500" : "text-green-500"
  const verdictBg = score > 70 ? "bg-destructive/10" : score > 40 ? "bg-yellow-500/10" : "bg-green-500/10"
  const Icon = score > 70 ? XCircle : score > 40 ? AlertTriangle : CheckCircle

  return (
    <div className={`glass rounded-2xl p-8 border border-border/50 ${verdictBg}`}>
      <div className="text-center">
        <Icon className={`h-20 w-20 mx-auto mb-4 ${verdictColor}`} />
        <p className="text-sm text-muted-foreground mb-2">Final Verdict</p>
        <h2 className={`text-4xl font-bold mb-4 ${verdictColor}`}>{verdict}</h2>
        <div className="flex items-center justify-center gap-8">
          <div>
            <p className="text-3xl font-bold font-mono">{score}%</p>
            <p className="text-xs text-muted-foreground">Manipulation Score</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="text-3xl font-bold font-mono">{confidence}%</p>
            <p className="text-xs text-muted-foreground">Confidence Level</p>
          </div>
        </div>
      </div>
    </div>
  )
}
