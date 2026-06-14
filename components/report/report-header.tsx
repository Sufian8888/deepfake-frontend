"use client"

import { FileText, Download, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { authAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface ReportHeaderProps {
  videoData?: any
}

export function ReportHeader({ videoData }: ReportHeaderProps) {
  const { plan, isLoading, isProOrAbove } = useSubscription()
  const router = useRouter()
  const user = authAPI.getCurrentUser()

  const handleUpgradeClick = () => {
    if (!user) {
      router.push('/login?redirect=/plans')
    } else {
      router.push('/plans')
    }
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
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          {isLoading ? (
            <Button size="sm" disabled className="gap-2">
              Loading...
            </Button>
          ) : isProOrAbove ? (
            <Button size="sm" className="gap-2 glow-blue">
              <Download className="h-4 w-4" />
              Download PDF
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
