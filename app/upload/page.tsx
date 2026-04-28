"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { UploadPanel } from "@/components/upload/upload-panel";
import { PreviewPanel } from "@/components/upload/preview-panel";
import { ProtectedRoute } from "@/components/protected-route";
import { uploadAPI, predictionsAPI } from "@/lib/api";
import { FALLBACK_MODEL_OPTIONS, type ModelOption } from "@/lib/model-options";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState<number | null>(null);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(FALLBACK_MODEL_OPTIONS);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await predictionsAPI.listModels();
        if (response?.models && Array.isArray(response.models) && response.models.length > 0) {
          setModelOptions(response.models);
        }
      } catch {
        setModelOptions(FALLBACK_MODEL_OPTIONS);
      }
    };

    fetchModels();
  }, []);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);

    try {
      // Upload the file to backend
      const response = await uploadAPI.uploadVideo(file);
      setUploadedVideoId(response.id);
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartAnalysis = async (modelKey: string) => {
    if (!uploadedVideoId) {
      toast({
        title: "Error",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      await predictionsAPI.startAnalysis(uploadedVideoId, modelKey);
      toast({
        title: "Analysis Started",
        description: `Your video is being analyzed with ${modelKey} model`,
      });
      // Redirect to user dashboard after starting analysis
      setTimeout(() => {
        router.push("/user-dashboard");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start analysis",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
                Upload &{" "}
                <span className="text-primary text-glow-blue">Analyze</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                Upload your video file to begin the deepfake detection analysis
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UploadPanel
                onFileSelect={handleFileSelect}
                isAnalyzing={isUploading || isAnalyzing}
                onStartAnalysis={handleStartAnalysis}
                modelOptions={modelOptions}
              />
              <PreviewPanel file={selectedFile} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
