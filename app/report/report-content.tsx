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
import { predictionsAPI, uploadAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function ReportPageContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!videoId) {
        setError("No video ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const video = await uploadAPI.getFile(parseInt(videoId));
        setVideoData(video);

        if (video.status === "completed") {
          const result = await predictionsAPI.getResult(parseInt(videoId));
          setAnalysisData(result);
        } else {
          setError(`Analysis is ${video.status}. Please wait for completion.`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [videoId]);

  if (isLoading) {
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

  const reportSummary = analysisData?.report_summary || analysisData?.analysis_details?.report_summary || {};
  const finalLabel = reportSummary.final_label || (analysisData?.is_deepfake ? "FAKE" : "REAL");
  const finalConfidence = Math.round(reportSummary.final_confidence ?? analysisData?.confidence_score ?? 0);
  const avgProbFake = typeof reportSummary.avg_prob_fake === "number" ? reportSummary.avg_prob_fake : null;
  const isDeepfake = finalLabel === "FAKE";

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-6">
          <ReportHeader videoData={videoData} analysisData={analysisData} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <VerdictCard
              finalLabel={finalLabel}
              finalConfidence={finalConfidence}
              avgProbFake={avgProbFake}
              fallbackIsDeepfake={isDeepfake}
            />
            <ExplanationSummary analysisData={analysisData} />
          </div>

          <HeatmapGrid analysisData={analysisData} videoData={videoData} />
          <AudioSyncChart analysisData={analysisData} />
          <AnomalyTable analysisData={analysisData} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
