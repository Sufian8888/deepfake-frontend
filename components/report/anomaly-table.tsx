import { AlertTriangle, AlertCircle, Info } from "lucide-react"

const anomalies = [
  {
    id: 1,
    type: "Audio-Lip Sync",
    description: "Significant mismatch between audio phonemes and lip positions",
    timestamp: "0:09 - 0:15",
    severity: "high",
    confidence: 94,
  },
  {
    id: 2,
    type: "Facial Boundary",
    description: "Blending artifacts detected around facial edges",
    timestamp: "0:12 - 0:18",
    severity: "high",
    confidence: 87,
  },
  {
    id: 3,
    type: "Temporal",
    description: "Optical flow inconsistency in frame sequence",
    timestamp: "0:25 - 0:28",
    severity: "medium",
    confidence: 72,
  },
  {
    id: 4,
    type: "Compression",
    description: "Unusual JPEG grid alignment in lower region",
    timestamp: "Full video",
    severity: "low",
    confidence: 58,
  },
  {
    id: 5,
    type: "Audio-Lip Sync",
    description: "Voice characteristics mismatch with facial expressions",
    timestamp: "0:30 - 0:33",
    severity: "high",
    confidence: 91,
  },
]

export function AnomalyTable() {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Severity</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((anomaly) => (
              <tr key={anomaly.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {anomaly.severity === "high" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : anomaly.severity === "medium" ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-500" />
                    )}
                    <span
                      className={`text-xs font-medium uppercase ${
                        anomaly.severity === "high"
                          ? "text-destructive"
                          : anomaly.severity === "medium"
                            ? "text-yellow-500"
                            : "text-blue-500"
                      }`}
                    >
                      {anomaly.severity}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-medium">{anomaly.type}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs">{anomaly.description}</td>
                <td className="py-3 px-4 text-sm font-mono">{anomaly.timestamp}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-sm font-mono ${
                      anomaly.confidence > 80
                        ? "text-destructive"
                        : anomaly.confidence > 60
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {anomaly.confidence}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
