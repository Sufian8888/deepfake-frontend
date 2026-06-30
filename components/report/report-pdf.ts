import { jsPDF } from "jspdf"
import {
  getAnnotatedFramePaths,
  getFrameAnalysis,
  getFrameConfidence,
  getFrameDetails,
  getFrameLabel,
  getFrameNumber,
  resolveFrameImageSrc,
} from "@/lib/frame-analysis"

type ReportInput = {
  analysisData: any
  videoId?: string | null
  videoData?: any
}

const THEME = {
  background: [15, 17, 23] as [number, number, number],
  card: [22, 25, 34] as [number, number, number],
  text: [250, 250, 250] as [number, number, number],
  muted: [161, 161, 170] as [number, number, number],
  primary: [77, 171, 247] as [number, number, number],
  purple: [167, 139, 250] as [number, number, number],
  destructive: [239, 68, 68] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  border: [42, 47, 61] as [number, number, number],
}

type PdfContext = {
  doc: jsPDF
  margin: number
  pageWidth: number
  pageHeight: number
  contentWidth: number
  y: number
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-"
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  return String(value)
}

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString()
}

function getVideoDisplayName(videoData?: any, videoId?: string | null) {
  return (
    videoData?.original_filename ||
    videoData?.filename ||
    (videoId ? `Video #${videoId}` : "Unknown Video")
  )
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_").slice(0, 80)
}

function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setFillColor(...THEME.card)
  doc.setDrawColor(...THEME.border)
  doc.roundedRect(x, y, w, h, 4, 4, "FD")
}

function drawProgressBar(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  value: number,
  color: [number, number, number]
) {
  doc.setFillColor(...THEME.border)
  doc.roundedRect(x, y, w, 4, 2, 2, "F")
  doc.setFillColor(...color)
  doc.roundedRect(x, y, (w * Math.min(100, Math.max(0, value))) / 100, 4, 2, 2, "F")
}

function paintPageBackground(ctx: PdfContext) {
  ctx.doc.setFillColor(...THEME.background)
  ctx.doc.rect(0, 0, ctx.pageWidth, ctx.pageHeight, "F")
}

function drawFooter(ctx: PdfContext, pageNumber: number, totalPages: number) {
  const { doc, margin, pageWidth, pageHeight } = ctx
  doc.setDrawColor(...THEME.border)
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)
  doc.setTextColor(...THEME.muted)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("deep-fake.dev · AI-Based Manipulated Media Detection", margin, pageHeight - 8)
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" })
}

function ensureSpace(ctx: PdfContext, needed: number) {
  if (ctx.y + needed <= ctx.pageHeight - 18) return
  ctx.doc.addPage()
  paintPageBackground(ctx)
  ctx.y = 18
}

function sectionTitle(ctx: PdfContext, title: string) {
  ensureSpace(ctx, 14)
  ctx.doc.setTextColor(...THEME.primary)
  ctx.doc.setFont("helvetica", "bold")
  ctx.doc.setFontSize(12)
  ctx.doc.text(title, ctx.margin, ctx.y)
  ctx.y += 8
}

function drawKeyValueRows(
  ctx: PdfContext,
  rows: Array<{ label: string; value: string }>
) {
  const rowHeight = 8
  const cardHeight = rows.length * rowHeight + 8
  ensureSpace(ctx, cardHeight + 4)
  drawCard(ctx.doc, ctx.margin, ctx.y, ctx.contentWidth, cardHeight)

  rows.forEach((row, index) => {
    const lineY = ctx.y + 7 + index * rowHeight
    ctx.doc.setTextColor(...THEME.muted)
    ctx.doc.setFont("helvetica", "normal")
    ctx.doc.setFontSize(9)
    ctx.doc.text(row.label, ctx.margin + 6, lineY)
    ctx.doc.setTextColor(...THEME.text)
    const valueLines = ctx.doc.splitTextToSize(row.value, ctx.contentWidth / 2)
    ctx.doc.text(valueLines, ctx.pageWidth - ctx.margin - 6, lineY, { align: "right" })
  })

  ctx.y += cardHeight + 6
}

function toJpegDataUri(value?: string | null) {
  if (!value) return null
  if (value.startsWith("data:")) return value
  return `data:image/jpeg;base64,${value}`
}

function drawWrappedText(
  ctx: PdfContext,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize = 9
) {
  ctx.doc.setFontSize(fontSize)
  const lines = ctx.doc.splitTextToSize(text, maxWidth)
  ctx.doc.text(lines, x, y)
  return lines.length * (fontSize * 0.45)
}

function drawHeaderBand(ctx: PdfContext, videoName: string) {
  const { doc, margin, pageWidth } = ctx

  doc.setFillColor(...THEME.card)
  doc.rect(0, 0, pageWidth, 36, "F")
  doc.setDrawColor(...THEME.primary)
  doc.setLineWidth(0.8)
  doc.line(0, 36, pageWidth, 36)

  doc.setTextColor(...THEME.primary)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("DeepFake Detection System", margin, 13)

  doc.setTextColor(...THEME.muted)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("Authenticity Verification Report", margin, 20)

  doc.setTextColor(...THEME.text)
  doc.setFontSize(8)
  const nameLines = doc.splitTextToSize(videoName, pageWidth - margin * 2)
  doc.text(nameLines.slice(0, 2), margin, 28)

  doc.setTextColor(...THEME.muted)
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 20, { align: "right" })

  ctx.y = 44
}

function drawSummaryPage(
  ctx: PdfContext,
  input: ReportInput,
  reportSummary: any,
  details: any,
  frameAnalysis: any
) {
  const { analysisData, videoData, videoId } = input
  const finalLabel = reportSummary.final_label || (analysisData?.is_deepfake ? "FAKE" : "REAL")
  const isFake = finalLabel === "FAKE"
  const finalConfidence = Math.round(reportSummary.final_confidence ?? analysisData?.confidence_score ?? 0)
  const avgProbFake = typeof reportSummary.avg_prob_fake === "number" ? reportSummary.avg_prob_fake : null
  const videoName = getVideoDisplayName(videoData, videoId)

  drawHeaderBand(ctx, videoName)

  sectionTitle(ctx, "Video Information")
  drawKeyValueRows(ctx, [
    { label: "Original filename", value: videoName },
    { label: "Video ID", value: formatValue(videoId ?? videoData?.id) },
    { label: "File size", value: formatFileSize(videoData?.file_size) },
    { label: "File type", value: formatValue(videoData?.file_type) },
    { label: "Uploaded", value: formatDate(videoData?.uploaded_at) },
    { label: "Analyzed", value: formatDate(videoData?.processed_at) },
    { label: "Status", value: formatValue(videoData?.status) },
    { label: "Model used", value: formatValue(details.model_key || details.model_file) },
    { label: "Analysis mode", value: formatValue(details.mode) },
  ])

  const verdictColor = isFake ? THEME.destructive : THEME.success
  const verdictText = isFake ? "LIKELY FAKE" : "LIKELY REAL"
  ensureSpace(ctx, 34)
  drawCard(ctx.doc, ctx.margin, ctx.y, ctx.contentWidth, 28)
  ctx.doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2])
  ctx.doc.roundedRect(ctx.margin + 6, ctx.y + 8, 4, 12, 1, 1, "F")
  ctx.doc.setTextColor(...THEME.muted)
  ctx.doc.setFontSize(9)
  ctx.doc.text("Verification Result", ctx.margin + 14, ctx.y + 12)
  ctx.doc.setTextColor(...verdictColor)
  ctx.doc.setFont("helvetica", "bold")
  ctx.doc.setFontSize(16)
  ctx.doc.text(verdictText, ctx.margin + 14, ctx.y + 21)
  ctx.doc.setTextColor(...THEME.muted)
  ctx.doc.setFont("helvetica", "normal")
  ctx.doc.setFontSize(9)
  ctx.doc.text("Confidence", ctx.pageWidth - ctx.margin - 40, ctx.y + 12)
  ctx.doc.setTextColor(...verdictColor)
  ctx.doc.setFont("helvetica", "bold")
  ctx.doc.setFontSize(20)
  ctx.doc.text(`${finalConfidence}%`, ctx.pageWidth - ctx.margin - 40, ctx.y + 22)
  ctx.y += 34

  const stats = [
    { label: "Total Frames", value: frameAnalysis?.total_frames ?? 0, color: THEME.primary },
    { label: "Fake Detected", value: frameAnalysis?.fake_frames ?? 0, color: THEME.destructive },
    { label: "Real Detected", value: frameAnalysis?.real_frames ?? 0, color: THEME.success },
    { label: "Suspicious", value: frameAnalysis?.suspicious_frames ?? 0, color: THEME.warning },
  ]
  ensureSpace(ctx, 26)
  const statW = (ctx.contentWidth - 9) / 4
  stats.forEach((stat, index) => {
    const x = ctx.margin + index * (statW + 3)
    drawCard(ctx.doc, x, ctx.y, statW, 20)
    ctx.doc.setTextColor(...THEME.muted)
    ctx.doc.setFontSize(8)
    ctx.doc.text(stat.label, x + 4, ctx.y + 8)
    ctx.doc.setTextColor(...stat.color)
    ctx.doc.setFont("helvetica", "bold")
    ctx.doc.setFontSize(14)
    ctx.doc.text(String(stat.value), x + 4, ctx.y + 16)
    ctx.doc.setFont("helvetica", "normal")
  })
  ctx.y += 28

  if (avgProbFake !== null) {
    drawKeyValueRows(ctx, [
      { label: "Average fake probability", value: `${(avgProbFake * 100).toFixed(1)}%` },
      { label: "Final label", value: finalLabel },
    ])
  }

  const findings: string[] = []
  if (typeof details.facial_consistency === "number") {
    findings.push(`Facial consistency: ${details.facial_consistency.toFixed(1)}%`)
  }
  if (typeof details.temporal_consistency === "number") {
    findings.push(`Temporal consistency: ${details.temporal_consistency.toFixed(1)}%`)
  }
  if (details.artifacts_detected === true) findings.push("Visual artifacts detected")
  if (frameAnalysis?.suspicious_frames > 0) {
    findings.push(`${frameAnalysis.suspicious_frames} of ${frameAnalysis.total_frames || 0} frames flagged`)
  }
  if (Array.isArray(analysisData?.suggestions)) {
    findings.push(
      ...analysisData.suggestions
        .slice(0, 4)
        .map((item: string) => item.replace(/[⚠️🔍📊🚨✅💡📈✔️]/g, "").trim())
    )
  }

  sectionTitle(ctx, "Key Findings")
  const findingsHeight = 12 + Math.max(findings.length, 1) * 8
  ensureSpace(ctx, findingsHeight)
  drawCard(ctx.doc, ctx.margin, ctx.y, ctx.contentWidth, findingsHeight)
  if (findings.length === 0) {
    ctx.doc.setTextColor(...THEME.muted)
    ctx.doc.setFontSize(9)
    ctx.doc.text("No additional findings available.", ctx.margin + 6, ctx.y + 10)
  } else {
    findings.forEach((finding, index) => {
      ctx.doc.setFillColor(...THEME.primary)
      ctx.doc.circle(ctx.margin + 8, ctx.y + 10 + index * 8, 0.8, "F")
      ctx.doc.setTextColor(...THEME.text)
      ctx.doc.setFontSize(9)
      const lines = ctx.doc.splitTextToSize(finding, ctx.contentWidth - 16)
      ctx.doc.text(lines, ctx.margin + 12, ctx.y + 11 + index * 8)
    })
  }
  ctx.y += findingsHeight + 6

  sectionTitle(ctx, "Technical Metrics")
  ensureSpace(ctx, 42)
  drawCard(ctx.doc, ctx.margin, ctx.y, ctx.contentWidth, 42)
  let metricY = ctx.y + 10
  if (typeof details.facial_consistency === "number") {
    ctx.doc.setTextColor(...THEME.muted)
    ctx.doc.setFontSize(9)
    ctx.doc.text("Facial Consistency", ctx.margin + 6, metricY)
    ctx.doc.setTextColor(...THEME.text)
    ctx.doc.text(`${details.facial_consistency.toFixed(1)}%`, ctx.pageWidth - ctx.margin - 6, metricY, {
      align: "right",
    })
    drawProgressBar(ctx.doc, ctx.margin + 6, metricY + 2, ctx.contentWidth - 12, details.facial_consistency, THEME.primary)
    metricY += 12
  }
  if (typeof details.temporal_consistency === "number") {
    ctx.doc.setTextColor(...THEME.muted)
    ctx.doc.text("Temporal Consistency", ctx.margin + 6, metricY)
    ctx.doc.setTextColor(...THEME.text)
    ctx.doc.text(`${details.temporal_consistency.toFixed(1)}%`, ctx.pageWidth - ctx.margin - 6, metricY, {
      align: "right",
    })
    drawProgressBar(ctx.doc, ctx.margin + 6, metricY + 2, ctx.contentWidth - 12, details.temporal_consistency, THEME.purple)
    metricY += 12
  }
  ctx.doc.setTextColor(...THEME.muted)
  ctx.doc.text("Artifacts Detected", ctx.margin + 6, metricY)
  ctx.doc.setTextColor(...(details.artifacts_detected ? THEME.destructive : THEME.success))
  ctx.doc.text(details.artifacts_detected ? "Yes" : "No", ctx.pageWidth - ctx.margin - 6, metricY, {
    align: "right",
  })
  ctx.y += 48
}

function drawFrameTablePage(ctx: PdfContext, frameDetails: any[]) {
  if (frameDetails.length === 0) return

  ctx.doc.addPage()
  paintPageBackground(ctx)
  ctx.y = 18

  sectionTitle(ctx, "Frame-by-Frame Breakdown")

  const colX = {
    frame: ctx.margin + 4,
    verdict: ctx.margin + 22,
    confidence: ctx.margin + 52,
    class: ctx.margin + 92,
  }

  ensureSpace(ctx, 12)
  drawCard(ctx.doc, ctx.margin, ctx.y, ctx.contentWidth, 10)
  ctx.doc.setTextColor(...THEME.primary)
  ctx.doc.setFont("helvetica", "bold")
  ctx.doc.setFontSize(8)
  ctx.doc.text("Frame", colX.frame, ctx.y + 7)
  ctx.doc.text("Verdict", colX.verdict, ctx.y + 7)
  ctx.doc.text("Confidence", colX.confidence, ctx.y + 7)
  ctx.doc.text("Class", colX.class, ctx.y + 7)
  ctx.y += 12

  frameDetails.forEach((frame, index) => {
    ensureSpace(ctx, 10)
    drawCard(ctx.doc, ctx.margin, ctx.y, ctx.contentWidth, 9)
    const details = frame.analysis_details || frame
    const label = getFrameLabel(frame)
    const confidence = getFrameConfidence(frame) ?? details.confidence ?? 0
    const frameNumber = String(getFrameNumber(frame, index))
    const predClass = formatValue(details.pred_class || frame.pred_class || frame.class)

    ctx.doc.setFont("helvetica", "normal")
    ctx.doc.setFontSize(8)
    ctx.doc.setTextColor(...THEME.text)
    ctx.doc.text(frameNumber, colX.frame, ctx.y + 6)
    ctx.doc.setTextColor(...(label === "FAKE" ? THEME.destructive : THEME.success))
    ctx.doc.text(label, colX.verdict, ctx.y + 6)
    ctx.doc.setTextColor(...THEME.text)
    ctx.doc.text(`${Number(confidence).toFixed(1)}%`, colX.confidence, ctx.y + 6)
    ctx.doc.text(predClass, colX.class, ctx.y + 6)
    ctx.y += 10
  })
}

function drawFrameImagesPages(ctx: PdfContext, analysisData: any, frameDetails: any[]) {
  const annotatedPaths = getAnnotatedFramePaths(analysisData)
  const modelUrl = (process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:5000").replace(/\/$/, "")

  const imageFrames = frameDetails
    .map((frame, index) => {
      const dataUri = toJpegDataUri(
        frame.thumbnail_base64 ||
          frame.image_base64 ||
          resolveFrameImageSrc(frame, {
            annotatedPath: annotatedPaths[index],
            modelUrl,
          })?.replace(/^data:image\/jpeg;base64,/, "")
      )

      if (!dataUri || !dataUri.startsWith("data:image/")) {
        const src = resolveFrameImageSrc(frame, {
          annotatedPath: annotatedPaths[index],
          modelUrl,
        })
        if (src?.startsWith("data:image/")) {
          return { frame, index, dataUri: src }
        }
        return null
      }

      return { frame, index, dataUri }
    })
    .filter(Boolean) as Array<{ frame: any; index: number; dataUri: string }>

  if (imageFrames.length === 0) return

  ctx.doc.addPage()
  paintPageBackground(ctx)
  ctx.y = 18
  sectionTitle(ctx, "Annotated Frame Evidence")

  const cols = 2
  const gap = 6
  const cardW = (ctx.contentWidth - gap) / cols
  const imageH = 42
  const cardH = imageH + 14
  let col = 0
  let rowY = ctx.y

  imageFrames.forEach((item) => {
    if (col === 0) {
      ensureSpace(ctx, cardH + 4)
      rowY = ctx.y
    }

    const x = ctx.margin + col * (cardW + gap)
    drawCard(ctx.doc, x, rowY, cardW, cardH)

    try {
      ctx.doc.addImage(item.dataUri, "JPEG", x + 3, rowY + 3, cardW - 6, imageH)
    } catch {
      ctx.doc.setTextColor(...THEME.muted)
      ctx.doc.setFontSize(8)
      ctx.doc.text("Image unavailable", x + 6, rowY + imageH / 2)
    }

    const label = getFrameLabel(item.frame)
    const confidence = getFrameConfidence(item.frame)
    ctx.doc.setTextColor(...THEME.text)
    ctx.doc.setFont("helvetica", "bold")
    ctx.doc.setFontSize(8)
    ctx.doc.text(`Frame ${getFrameNumber(item.frame, item.index)}`, x + 4, rowY + imageH + 8)
    ctx.doc.setTextColor(...(label === "FAKE" ? THEME.destructive : THEME.success))
    ctx.doc.text(label, x + cardW - 18, rowY + imageH + 8)
    if (confidence !== null) {
      ctx.doc.setTextColor(...THEME.muted)
      ctx.doc.setFont("helvetica", "normal")
      ctx.doc.text(`${confidence.toFixed(1)}%`, x + cardW - 18, rowY + imageH + 12)
    }

    col += 1
    if (col >= cols) {
      col = 0
      ctx.y = rowY + cardH + 4
    }
  })

  if (col !== 0) {
    ctx.y = rowY + cardH + 4
  }
}

function drawSuggestionsPage(ctx: PdfContext, suggestions?: string[]) {
  if (!suggestions?.length) return

  ensureSpace(ctx, 20)
  if (ctx.y > ctx.pageHeight - 60) {
    ctx.doc.addPage()
    paintPageBackground(ctx)
    ctx.y = 18
  }

  sectionTitle(ctx, "Recommendations")
  const cardHeight = 10 + suggestions.length * 8
  ensureSpace(ctx, cardHeight)
  drawCard(ctx.doc, ctx.margin, ctx.y, ctx.contentWidth, cardHeight)

  suggestions.forEach((item, index) => {
    const clean = item.replace(/[⚠️🔍📊🚨✅💡📈✔️]/g, "").trim()
    ctx.doc.setTextColor(...THEME.text)
    ctx.doc.setFontSize(9)
    const lines = ctx.doc.splitTextToSize(`• ${clean}`, ctx.contentWidth - 12)
    ctx.doc.text(lines, ctx.margin + 6, ctx.y + 8 + index * 8)
  })
  ctx.y += cardHeight + 6
}

export async function downloadAnalysisReportPdf(input: ReportInput) {
  if (typeof window === "undefined") return

  const { analysisData, videoId, videoData } = input
  const reportSummary = analysisData?.report_summary || analysisData?.analysis_details?.report_summary || {}
  const details = analysisData?.analysis_details || {}
  const frameAnalysis = getFrameAnalysis(analysisData)
  const frameDetails = getFrameDetails(analysisData)

  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 16

  const ctx: PdfContext = {
    doc,
    margin,
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - margin * 2,
    y: 0,
  }

  paintPageBackground(ctx)
  drawSummaryPage(ctx, input, reportSummary, details, frameAnalysis)
  drawFrameTablePage(ctx, frameDetails)
  drawFrameImagesPages(ctx, analysisData, frameDetails)
  drawSuggestionsPage(ctx, analysisData?.suggestions)

  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    drawFooter({ ...ctx, y: 0 }, page, totalPages)
  }

  const videoName = getVideoDisplayName(videoData, videoId)
  const safeName = sanitizeFilename(videoName.replace(/\.[^.]+$/, ""))
  doc.save(`deepfake-report-${safeName || videoId || "latest"}.pdf`)
}
