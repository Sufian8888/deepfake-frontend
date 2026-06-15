"use client"

import { FileText, Download, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { authAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { downloadAnalysisReport } from "./report-download"

interface ReportHeaderProps {
  videoData?: any
  analysisData?: any
}

export function ReportHeader({ videoData, analysisData }: ReportHeaderProps) {
  const { isLoading, isProOrAbove } = useSubscription()
  const router = useRouter()
  const user = authAPI.getCurrentUser()

  const handleUpgradeClick = () => {
    if (!user) {
      router.push('/login?redirect=/plans')
    } else {
      router.push('/plans')
    }
  }

  const handleDownload = () => {
    downloadAnalysisReport({
      analysisData,
      videoId: videoData?.id ? String(videoData.id) : null,
      videoData,
    })
  }

  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center glow-blue">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Authenticity Verification Report</h1>
            <p className="text-sm text-muted-foreground">
              {videoData?.original_filename ? `Analyzing ${videoData.original_filename}` : "Generated on December 5, 2024 at 14:32 UTC"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Button size="sm" disabled className="gap-2">
              Loading...
            </Button>
          ) : isProOrAbove ? (
            <Button size="sm" onClick={handleDownload} className="gap-2 glow-blue">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handleUpgradeClick} className="gap-2">
              <Download className="h-4 w-4" />
              Upgrade to download
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
