"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Image as ImageIcon } from "lucide-react";

interface AnalysisTabsProps {
  analysisData?: any;
}

export function AnalysisTabs({ analysisData }: AnalysisTabsProps) {
  if (!analysisData || !analysisData.analysis_details) {
    return (
      <div className="glass rounded-2xl p-6 border border-border/50">
        <p className="text-muted-foreground text-center">No analysis data available</p>
      </div>
    );
  }

  const details = analysisData.analysis_details;
  const frameAnalysis = details.frame_analysis || {};
  const frameDetails = frameAnalysis.frame_details || [];
  const annotatedFrames = details.annotated_frames || [];
  const rawModelUrl = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:5000";
  const normalizedModelUrl = rawModelUrl.replace(/\/$/, "");

  const resolveAnnotatedFrameUrl = (framePath: string) => {
    const normalizedFramePath = String(framePath).replace(/\\/g, "/").replace(/^\/+/, "");
    const relativePath = normalizedFramePath
      .replace(/^model\/analysis_results\//, "")
      .replace(/^analysis_results\//, "");

    return `${normalizedModelUrl}/model/analysis_results/${relativePath}`;
  };

  // Calculate statistics from real data
  const totalFrames = frameAnalysis.total_frames || 0;
  const fakeFrames = frameAnalysis.fake_frames || 0;
  const realFrames = frameAnalysis.real_frames || 0;
  const suspiciousFrames = frameAnalysis.suspicious_frames || 0;
  
  const fakePercentage = totalFrames > 0 ? Math.round((fakeFrames / totalFrames) * 100) : 0;
  const realPercentage = totalFrames > 0 ? Math.round((realFrames / totalFrames) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Frame Statistics */}
      <Card className="glass border-border/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Frame Analysis Statistics</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold text-primary">{totalFrames}</p>
            <p className="text-sm text-muted-foreground">Total Frames</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold text-destructive">{fakeFrames}</p>
            <p className="text-sm text-muted-foreground">Fake Detected</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-500/10">
            <p className="text-2xl font-bold text-green-500">{realFrames}</p>
            <p className="text-sm text-muted-foreground">Real Detected</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-500/10">
            <p className="text-2xl font-bold text-yellow-500">{suspiciousFrames}</p>
            <p className="text-sm text-muted-foreground">Suspicious</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Fake Frames</span>
              <span className="text-destructive font-mono">{fakePercentage}%</span>
            </div>
            <Progress value={fakePercentage} className="h-3 [&>div]:bg-destructive" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Real Frames</span>
              <span className="text-green-500 font-mono">{realPercentage}%</span>
            </div>
            <Progress value={realPercentage} className="h-3 [&>div]:bg-green-500" />
          </div>
        </div>
      </Card>

      {/* Frame-by-Frame Details */}
      {frameDetails.length > 0 && (
        <Card className="glass border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Frame-by-Frame Analysis</h2>
          
          <div className="space-y-3">
            {frameDetails.map((frame: any) => (
              <div
                key={frame.frame_num}
                className={`p-4 rounded-lg border-2 ${
                  frame.is_suspicious
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'border-green-500/50 bg-green-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {frame.is_suspicious ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-semibold">Frame {frame.frame_num}</p>
                      <p className="text-sm text-muted-foreground">
                        {frame.faces_detected} face(s) detected
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={frame.label === 'FAKE' ? 'destructive' : 'default'}
                      className={frame.label === 'REAL' ? 'bg-green-500' : ''}
                    >
                      {frame.label}
                    </Badge>
                    <p className={`text-sm font-mono mt-1 ${
                      frame.is_suspicious ? 'text-destructive' : 'text-green-500'
                    }`}>
                      {frame.confidence.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Annotated Frames Grid */}
      {annotatedFrames.length > 0 && (
        <Card className="glass border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Annotated Frames (Face Detection)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {annotatedFrames.map((framePath: string, idx: number) => (
              <div key={idx} className="relative group">
                <img
                  src={resolveAnnotatedFrameUrl(framePath)}
                  alt={`Annotated frame ${idx + 1}`}
                  className="w-full h-auto rounded-lg border border-border/50 transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-xs text-white">
                  Frame {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Technical Metrics */}
      <Card className="glass border-border/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Technical Metrics</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Facial Consistency Score</span>
              <span className="font-mono">{Math.round(details.facial_consistency || 0)}%</span>
            </div>
            <Progress 
              value={details.facial_consistency || 0} 
              className="h-2 [&>div]:bg-primary" 
            />
          </div>
          
          {details.temporal_consistency && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Temporal Consistency</span>
                <span className="font-mono">{Math.round(details.temporal_consistency)}%</span>
              </div>
              <Progress 
                value={details.temporal_consistency} 
                className="h-2 [&>div]:bg-blue-500" 
              />
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span>Artifacts Detected</span>
            <Badge variant={details.artifacts_detected ? 'destructive' : 'default'}>
              {details.artifacts_detected ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span>Analysis Mode</span>
            <Badge variant="outline">{details.mode || 'N/A'}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span>Model Used</span>
            <Badge variant="outline">{details.model_key || details.model_file || 'N/A'}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
