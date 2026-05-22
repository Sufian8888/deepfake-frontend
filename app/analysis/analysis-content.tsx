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
  const videoIdParam = searchParams.get("videoId");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  // First effect: extract videoId from URL or searchParams
  useEffect(() => {
    if (videoIdParam) {
      setVideoId(videoIdParam);
    } else if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const idFromUrl = url.searchParams.get("videoId");
      if (idFromUrl) {
        setVideoId(idFromUrl);
      } else {
        // If no videoId, fetch latest analysis
        fetchLatestAnalysis();
      }
    }
  }, [videoIdParam]);

  // Fetch latest analysis when no videoId provided
  const fetchLatestAnalysis = async () => {
    try {
      // use `listFiles` (existing API) instead of non-existent `getFiles`
      const videos = await uploadAPI.listFiles();
      if (videos.length === 0) {
        setError("No videos found");
        setIsLoading(false);
        return;
      }

      // Get most recent completed analysis
      const completedVideos = videos.filter((v: any) => v.status === "completed").sort((a: any, b: any) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA; // Most recent first
      });

      if (completedVideos.length === 0) {
        setError("No completed analyses found");
        setIsLoading(false);
        return;
      }

      setVideoId(completedVideos[0].id.toString());
    } catch (err: any) {
      setError(err.message || "Failed to fetch latest analysis");
      setIsLoading(false);
    }
  };

  // Second effect: fetch data once videoId is available
  useEffect(() => {
    if (!videoId) return;

    const fetchAnalysisData = async () => {
      try {
        const id = parseInt(videoId);
        // Fetch video details
        const video = await uploadAPI.getFile(id);
        setVideoData(video);

        // Check if analysis is completed
        if (video.status === "completed") {
          const result = await predictionsAPI.getResult(id);
          console.log("🔍 DEBUG: Full analysis result:", result);
          console.log("🔍 DEBUG: Annotated frames:", result?.analysis_details?.annotated_frames);
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!videoId || !analysisData) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading analysis...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto ml-[var(--app-sidebar-width,16rem)]">
          <div className="container mx-auto py-8 px-4 space-y-8">
            <ResultsSummary analysisData={analysisData} videoId={videoId} />
            {videoData && analysisData && (
              <>
                <VideoComparison videoData={videoData} analysisData={analysisData} />
                <AnalysisTabs analysisData={analysisData} />
              </>
            )}
            {(!videoData || !analysisData) && (
              <div className="text-center text-muted-foreground">
                <p>Some analysis components could not load. Please refresh the page.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
