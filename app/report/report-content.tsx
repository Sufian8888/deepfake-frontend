"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { ReportHeader } from "@/components/report/report-header";
import { VerdictCard } from "@/components/report/verdict-card";
import { HeatmapGrid } from "@/components/report/heatmap-grid";
import { AudioSyncChart } from "@/components/report/audio-sync-chart";
import { AnomalyTable } from "@/components/report/anomaly-table";
import { ExplanationSummary } from "@/components/report/explanation-summary";
import { useFrameThumbnails } from "@/hooks/use-frame-thumbnails";
import { useAnalysisCache } from "@/lib/stores/analysis-cache";
import { Loader2 } from "lucide-react";

export function ReportPageContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedEntry = useAnalysisCache((state) => state.getEntry);
  const prefetchVideo = useAnalysisCache((state) => state.prefetchVideo);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!videoId) {
        setError("No video ID provided");
        setIsLoading(false);
        return;
      }

      const id = parseInt(videoId, 10);
      const cached = getCachedEntry(id);

      if (cached) {
        setVideoData(cached.video);
        setAnalysisData(cached.analysis);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        const entry = await prefetchVideo(id, { force: !cached });
        if (!entry) {
          if (!cached) {
            setError("Failed to load report data");
          }
          return;
        }

        setVideoData(entry.video);
        setAnalysisData(entry.analysis);

        if (entry.video.status !== "completed") {
          setError(`Analysis is ${entry.video.status}. Please wait for completion.`);
        }
      } catch (err: any) {
        if (!cached) {
          setError(err.message || "Failed to load report data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [videoId, getCachedEntry, prefetchVideo]);

  const numericVideoId = videoId ? parseInt(videoId, 10) : undefined;
  const { enrichedAnalysisData } = useFrameThumbnails(numericVideoId, analysisData);
  const displayAnalysisData = enrichedAnalysisData || analysisData;

  if (isLoading && !displayAnalysisData) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading report...</p>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
            <div>
              <p className="mb-4 text-destructive">{error}</p>
              <a href="/user-dashboard" className="text-primary hover:underline">
                Go to Dashboard
              </a>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const reportSummary = displayAnalysisData?.report_summary || displayAnalysisData?.analysis_details?.report_summary || {};
  const finalLabel = reportSummary.final_label || (displayAnalysisData?.is_deepfake ? "FAKE" : "REAL");
  const finalConfidence = Math.round(reportSummary.final_confidence ?? displayAnalysisData?.confidence_score ?? 0);
  const avgProbFake = typeof reportSummary.avg_prob_fake === "number" ? reportSummary.avg_prob_fake : null;
  const isDeepfake = finalLabel === "FAKE";

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-6">
          <ReportHeader videoData={videoData} analysisData={displayAnalysisData} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <VerdictCard
              finalLabel={finalLabel}
              finalConfidence={finalConfidence}
              avgProbFake={avgProbFake}
              fallbackIsDeepfake={isDeepfake}
            />
            <ExplanationSummary analysisData={displayAnalysisData} />
          </div>

          <HeatmapGrid analysisData={displayAnalysisData} videoData={videoData} />
          <AudioSyncChart analysisData={displayAnalysisData} />
          <AnomalyTable analysisData={displayAnalysisData} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
