"use client"

import { AlertTriangle, CheckCircle, XCircle, ArrowRight, Film, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Download } from "lucide-react"
import { downloadAnalysisReport } from "@/components/report/report-download"

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

  try {
    const reportSummary = analysisData.report_summary || analysisData.analysis_details?.report_summary || {}
    const finalLabel = reportSummary.final_label || (analysisData.is_deepfake ? "FAKE" : "REAL")
    const overallScore = Math.round(reportSummary.final_confidence ?? analysisData.confidence_score ?? 0)
    const avgProbFake = typeof reportSummary.avg_prob_fake === 'number' ? reportSummary.avg_prob_fake : null
    const isDeepfake = finalLabel === "FAKE"
    const verdict = isDeepfake ? "LIKELY FAKE" : "LIKELY REAL"
    const verdictColor = isDeepfake ? "text-destructive" : "text-green-500"
    const verdictBg = isDeepfake ? "bg-destructive/20" : "bg-green-500/20"
    const reportHref = videoId ? `/report?videoId=${videoId}` : "/report"

    const handleDownload = () => {
      downloadAnalysisReport({ analysisData, videoId })
    }

    const details = analysisData.analysis_details || {}
    const frameAnalysis = details.frame_analysis || reportSummary.frame_breakdown || {}
    const keyFindings = []

    // Generate findings from analysis details
    if (typeof details.facial_consistency === 'number') {
      const severity = details.facial_consistency < 50 ? "high" : details.facial_consistency < 70 ? "medium" : "low"
      keyFindings.push({
        label: `Facial consistency: ${details.facial_consistency?.toFixed(1)}%`,
        severity
      })
    }

    if (typeof details.audio_sync === 'number') {
      const severity = details.audio_sync < 50 ? "high" : details.audio_sync < 70 ? "medium" : "low"
      keyFindings.push({
        label: `Audio-visual sync: ${details.audio_sync?.toFixed(1)}%`,
        severity
      })
    }

    if (details.artifacts_detected === true) {
      keyFindings.push({
        label: "Visual artifacts detected",
        severity: "high"
      })
    }

    if (frameAnalysis) {
      const { total_frames, suspicious_frames } = frameAnalysis
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
      <div className="space-y-6">
        {/* Verdict Card */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">Analysis Summary</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
                <Link href={reportHref}>
                  <ArrowRight className="h-4 w-4" />
                  Open Report
                </Link>
              </Button>
              <Button size="sm" onClick={handleDownload} className="gap-2 glow-blue">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>

          <div className={`rounded-xl p-4 sm:p-6 ${verdictBg} mb-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                {isDeepfake ? (
                  <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive shrink-0" />
                ) : (
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 shrink-0" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification Result</p>
                  <p className={`text-xl sm:text-2xl font-bold ${verdictColor}`}>{verdict}</p>
                </div>
              </div>
              <div className="sm:ml-auto sm:text-right">
                <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                <p className={`text-2xl sm:text-3xl font-bold font-mono ${verdictColor}`}>{overallScore}%</p>
              </div>
            </div>
          </div>

          {/* Frame Statistics */}
          {frameAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Total Frames</p>
                <p className="text-2xl font-bold">{frameAnalysis.total_frames || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-xs text-muted-foreground mb-1">Fake Detected</p>
                <p className="text-2xl font-bold text-destructive">{frameAnalysis.fake_frames || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-xs text-muted-foreground mb-1">Real Detected</p>
                <p className="text-2xl font-bold text-green-500">{frameAnalysis.real_frames || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-xs text-muted-foreground mb-1">Suspicious</p>
                <p className="text-2xl font-bold text-yellow-500">{frameAnalysis.suspicious_frames || 0}</p>
              </div>
            </div>
          )}

          {avgProbFake !== null && (
            <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Average fake probability</span>
                <span className="font-mono text-sm">{(avgProbFake * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}

          {keyFindings.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Key Findings
              </h3>
              <div className="space-y-2">
                {keyFindings.map((finding, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
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
        </div>

        {/* Technical Details */}
        {(details.facial_consistency !== undefined || details.temporal_consistency !== undefined) && (
          <div className="glass rounded-2xl p-6 border border-border/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Film className="h-4 w-4" />
              Technical Metrics
            </h3>
            <div className="space-y-4">
              {typeof details.facial_consistency === 'number' && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Facial Consistency</span>
                    <span className="font-mono">{details.facial_consistency.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded bg-muted/30 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, details.facial_consistency)}%` }}
                    />
                  </div>
                </div>
              )}
              {typeof details.temporal_consistency === 'number' && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Temporal Consistency</span>
                    <span className="font-mono">{details.temporal_consistency.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded bg-muted/30 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(100, details.temporal_consistency)}%` }}
                    />
                  </div>
                </div>
              )}
              {details.artifacts_detected !== undefined && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span>Artifacts Detected</span>
                  <Badge variant={details.artifacts_detected ? 'destructive' : 'default'}>
                    {details.artifacts_detected ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  } catch (err: any) {
    console.error('ResultsSummary error:', err)
    return (
      <div className="glass rounded-2xl p-6 border border-border/50 border-destructive/50 bg-destructive/5">
        <p className="text-destructive text-center">Error rendering analysis results: {err?.message || 'Unknown error'}</p>
      </div>
    )
  }
}
