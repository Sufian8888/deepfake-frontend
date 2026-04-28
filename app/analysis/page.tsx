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

export default function AnalysisPage() {
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
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 ml-64 p-8 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading analysis data...</p>
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

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
                DeepFake{" "}
                <span className="text-primary text-glow-blue">
                  Analysis Results
                </span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                Comprehensive multi-modal analysis of your uploaded video
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <VideoComparison videoData={videoData} analysisData={analysisData} />
                <AnalysisTabs analysisData={analysisData} />
              </div>
              <div>
                <ResultsSummary analysisData={analysisData} videoId={videoId} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
