import { applyThumbnailsToAnalysis } from "@/lib/frame-analysis"
import { predictionsAPI, uploadAPI } from "@/lib/api"

type ReportInput = {
  analysisData: any
  videoId?: string | null
  videoData?: any
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }

  return String(value)
}

async function enrichReportInput(input: ReportInput): Promise<ReportInput> {
  const videoId = input.videoId ?? (input.videoData?.id ? String(input.videoData.id) : null)
  if (!videoId || !input.analysisData) {
    return input
  }

  const id = parseInt(videoId, 10)
  if (Number.isNaN(id)) {
    return input
  }

  let videoData = input.videoData
  let analysisData = input.analysisData

  try {
    if (!videoData?.original_filename) {
      videoData = await uploadAPI.getFile(id)
    }
  } catch {
    // Keep whatever video metadata was already available.
  }

  try {
    const thumbResponse = await predictionsAPI.getFrameThumbnails(id, 0, 50)
    const thumbMap: Record<number, string> = {}
    for (const item of thumbResponse?.items || []) {
      if (item?.thumbnail_base64) {
        thumbMap[item.frame_number] = item.thumbnail_base64
      }
    }
    if (Object.keys(thumbMap).length > 0) {
      analysisData = applyThumbnailsToAnalysis(analysisData, thumbMap)
    }
  } catch {
    // PDF can still be generated without frame images.
  }

  return {
    ...input,
    videoId,
    videoData,
    analysisData,
  }
}

export function buildAnalysisReportMarkdown({ analysisData, videoId, videoData }: ReportInput) {
  const reportSummary = analysisData?.report_summary || analysisData?.analysis_details?.report_summary || {}
  const details = analysisData?.analysis_details || {}
  const finalLabel = reportSummary.final_label || (analysisData?.is_deepfake ? "FAKE" : "REAL")
  const finalConfidence = Math.round(reportSummary.final_confidence ?? analysisData?.confidence_score ?? 0)
  const avgProbFake = typeof reportSummary.avg_prob_fake === "number" ? reportSummary.avg_prob_fake : null
  const frameAnalysis = details.frame_analysis || reportSummary.frame_breakdown || {}
  const findings: string[] = []

  if (typeof details.facial_consistency === "number") {
    findings.push(`Facial consistency: ${details.facial_consistency.toFixed(1)}%`)
  }

  if (typeof details.audio_sync === "number") {
    findings.push(`Audio-visual sync: ${details.audio_sync.toFixed(1)}%`)
  }

  if (details.artifacts_detected === true) {
    findings.push("Visual artifacts detected")
  }

  if (frameAnalysis?.suspicious_frames > 0) {
    findings.push(`${frameAnalysis.suspicious_frames} of ${frameAnalysis.total_frames || 0} frames flagged`)
  }

  if (Array.isArray(analysisData?.suggestions)) {
    findings.push(...analysisData.suggestions.slice(0, 3).map((item: string) => item.replace(/[⚠️🔍📊🚨✅💡📈✔️]/g, "").trim()))
  }

  const lines = [
    "# DeepFake Analysis Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Video ID: ${formatValue(videoId)}`,
    `Filename: ${formatValue(videoData?.original_filename)}`,
    `Status: ${formatValue(videoData?.status)}`,
    "",
    "## Verdict",
    `- Final label: ${finalLabel}`,
    `- Final confidence: ${finalConfidence}%`,
    `- Average fake probability: ${avgProbFake !== null ? `${(avgProbFake * 100).toFixed(1)}%` : "-"}`,
    "",
    "## Summary Metrics",
    `- Total frames: ${formatValue(frameAnalysis?.total_frames)}`,
    `- Fake detected: ${formatValue(frameAnalysis?.fake_frames)}`,
    `- Real detected: ${formatValue(frameAnalysis?.real_frames)}`,
    `- Suspicious: ${formatValue(frameAnalysis?.suspicious_frames)}`,
    "",
    "## Key Findings",
    findings.length > 0 ? findings.map((finding) => `- ${finding}`).join("\n") : "- No additional findings available.",
    "",
    "## Technical Details",
    `- Facial consistency: ${formatValue(details.facial_consistency)}%`,
    `- Temporal consistency: ${formatValue(details.temporal_consistency)}%`,
    `- Artifacts detected: ${details.artifacts_detected ? "Yes" : "No"}`,
  ]

  return lines.join("\n")
}

export async function downloadAnalysisReport(input: ReportInput) {
  if (typeof window === "undefined") {
    return
  }

  const enriched = await enrichReportInput(input)
  const { downloadAnalysisReportPdf } = await import("./report-pdf")
  await downloadAnalysisReportPdf(enriched)
}
