"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildHeatmapPreviewItems,
  getAnnotatedFramePaths,
  getFrameAnalysis,
  getFrameDetails,
  getFrameLabel,
  getFrameNumber,
} from "@/lib/frame-analysis";

interface AnalysisTabsProps {
  analysisData?: any;
}

export function AnalysisTabs({ analysisData }: AnalysisTabsProps) {
  try {
    if (!analysisData || !analysisData.analysis_details) {
      return (
        <div className="glass rounded-2xl p-6 border border-border/50">
          <p className="text-muted-foreground text-center">No analysis data available</p>
        </div>
      );
    }

  const details = analysisData.analysis_details;
  const frameAnalysis = getFrameAnalysis(analysisData);
  const frameDetails = getFrameDetails(analysisData);
  const annotatedFrames = getAnnotatedFramePaths(analysisData);
  const previewItems = buildHeatmapPreviewItems(analysisData, annotatedFrames.length || frameDetails.length || 12);
  const visiblePreviewItems = previewItems.filter((item) => Boolean(item.src));
  const hasFrameMetadata = frameDetails.length > 0 || annotatedFrames.length > 0;

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

      {/* Frame-by-Frame Details Table */}
      {frameDetails.length > 0 && (
        <Card className="glass border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Frame-by-Frame Breakdown</h2>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="w-32">Score</TableHead>
                  <TableHead>Faces</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frameDetails.map((frame: any, idx: number) => {
                  const details = frame.analysis_details || frame;
                  const confidence = frame.confidence_score ?? details.confidence ?? frame.confidence ?? 0;
                  const isSuspicious = frame.is_suspicious ?? details.is_suspicious ?? frame.is_fake;

                  return (
                  <TableRow key={idx} className={isSuspicious ? 'bg-destructive/5' : ''}>
                    <TableCell className="font-mono font-semibold">
                      {getFrameNumber(frame, idx)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isSuspicious ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <Badge variant="destructive">{getFrameLabel(frame)}</Badge>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              {getFrameLabel(frame)}
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{details.pred_class || frame.pred_class || frame.class || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(100, Math.max(0, confidence))}
                          className="h-2 w-24" 
                        />
                        <span className={`font-mono text-sm ${
                          isSuspicious ? 'text-destructive' : 'text-green-500'
                        }`}>
                          {confidence.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {(details.raw_score ?? frame.raw_score ?? frame.p_fake ?? confidence ?? 0).toFixed(4)}
                    </TableCell>
                    <TableCell className="text-center">
                      {(details.faces_detected ?? frame.faces_detected ?? 0) > 0 ? (
                        <Badge variant="outline">{details.faces_detected ?? frame.faces_detected}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Annotated Frames Grid */}
      {hasFrameMetadata && (
        <Card className="glass border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Annotated Frames (Face Detection)
          </h2>

          {visiblePreviewItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {visiblePreviewItems.map((item, idx) => (
                <div key={item.key} className="relative group">
                  <img
                    src={item.src!}
                    alt={`Annotated frame ${getFrameNumber(item.frame, idx)}`}
                    className="w-full h-auto rounded-lg border border-border/50 transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-xs text-white">
                    Frame {getFrameNumber(item.frame, idx)}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant={getFrameLabel(item.frame) === "FAKE" ? "destructive" : "outline"}>
                      {getFrameLabel(item.frame)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {frameDetails.length || annotatedFrames.length} frames were analyzed, but the saved frame images are no longer available.
              Re-run analysis on this video to regenerate annotated frames.
            </p>
          )}
        </Card>
      )}

      {/* Technical Metrics */}
      <Card className="glass border-border/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Technical Metrics</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Facial Consistency Score</span>
              <span className="font-mono">{Math.round((details.facial_consistency ?? 0))}%</span>
            </div>
            <Progress 
              value={Math.min(100, Math.max(0, details.facial_consistency ?? 0))}
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
                value={Math.min(100, Math.max(0, details.temporal_consistency))}
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
  } catch (err: any) {
    console.error('AnalysisTabs error:', err)
    return (
      <div className="glass rounded-2xl p-6 border border-border/50 border-destructive/50 bg-destructive/5">
        <p className="text-destructive text-center">Error rendering analysis tabs: {err?.message || 'Unknown error'}</p>
      </div>
    )
  }
}
