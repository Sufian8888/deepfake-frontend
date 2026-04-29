"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/ui/app-sidebar";
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
        // Fetch video details
        const video = await uploadAPI.getFile(parseInt(videoId));
        setVideoData(video);

        // Check if analysis is completed
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
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 ml-64 p-8 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading report...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 ml-64 p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <a href="/user-dashboard" className="text-primary hover:underline">
                Go to Dashboard
              </a>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const score = Math.round(analysisData?.confidence_score || 0);
  const isDeepfake = analysisData?.is_deepfake || false;
  const confidence = isDeepfake ? score : 100 - score;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <ReportHeader videoData={videoData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VerdictCard 
                score={score} 
                confidence={confidence}
                isDeepfake={isDeepfake}
              />
              <ExplanationSummary analysisData={analysisData} />
            </div>

            <HeatmapGrid analysisData={analysisData} />
            <AudioSyncChart analysisData={analysisData} />
            <AnomalyTable analysisData={analysisData} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
