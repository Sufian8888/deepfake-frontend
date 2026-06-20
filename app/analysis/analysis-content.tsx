"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { VideoComparison } from "@/components/analysis/video-comparison";
import { AnalysisTabs } from "@/components/analysis/analysis-tabs";
import { ResultsSummary } from "@/components/analysis/results-summary";
import { ProtectedRoute } from "@/components/protected-route";
import { predictionsAPI, uploadAPI } from "@/lib/api";
import { useFrameThumbnails } from "@/hooks/use-frame-thumbnails";
import { Loader2 } from "lucide-react";

export function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get("videoId");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (videoIdParam) {
      setVideoId(videoIdParam);
    } else if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const idFromUrl = url.searchParams.get("videoId");
      if (idFromUrl) {
        setVideoId(idFromUrl);
      } else {
        fetchLatestAnalysis();
      }
    }
  }, [videoIdParam]);

  const fetchLatestAnalysis = async () => {
    try {
      const video = await uploadAPI.getLatestCompleted();
      setVideoId(video.id.toString());
    } catch (err: any) {
      setError(err.message || "Failed to fetch latest analysis");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!videoId) return;

    const fetchAnalysisData = async () => {
      try {
        const id = parseInt(videoId);
        const [video, result] = await Promise.all([
          uploadAPI.getFile(id),
          predictionsAPI.getResult(id).catch(() => null),
        ]);
        setVideoData(video);

        if (video.status === "completed") {
          if (result) {
            setAnalysisData(result);
          } else {
            setError("Failed to load analysis results");
          }
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

  const numericVideoId = videoId ? parseInt(videoId, 10) : undefined;
  const { enrichedAnalysisData } = useFrameThumbnails(numericVideoId, analysisData);
  const displayAnalysisData = enrichedAnalysisData || analysisData;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <p className="mb-2 text-lg font-semibold text-destructive">Error</p>
              <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (!videoId || !displayAnalysisData) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
            Loading analysis...
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell fullHeight>
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          <ResultsSummary analysisData={displayAnalysisData} videoId={videoId} />
          {videoData && displayAnalysisData && (
            <>
              <VideoComparison videoData={videoData} analysisData={displayAnalysisData} />
              <AnalysisTabs analysisData={displayAnalysisData} />
            </>
          )}
          {(!videoData || !displayAnalysisData) && (
            <div className="text-center text-muted-foreground">
              <p>Some analysis components could not load. Please refresh the page.</p>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
