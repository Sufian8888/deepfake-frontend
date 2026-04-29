"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { VideoComparison } from "@/components/analysis/video-comparison";
import { AnalysisTabs } from "@/components/analysis/analysis-tabs";
import { ResultsSummary } from "@/components/analysis/results-summary";
import { ProtectedRoute } from "@/components/protected-route";
import { predictionsAPI, uploadAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
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
        setError(err.message || "Failed to load analysis data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8 px-4 space-y-8">
            <ResultsSummary data={analysisData} videoData={videoData} />
            <VideoComparison videoId={parseInt(videoId || "0")} />
            <AnalysisTabs data={analysisData} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
