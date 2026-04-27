"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoData {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  status: "pending" | "processing" | "completed" | "failed";
  is_deepfake: boolean | null;
  confidence_score: number | null;
  uploaded_at: string;
  user_email?: string;
  user_name?: string;
}

export function VideosTable() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const filtered = videos.filter(
      (video) =>
        video.original_filename
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        video.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  const fetchVideos = async () => {
    try {
      const data = await adminAPI.getAllVideos();
      setVideos(data);
      setFilteredVideos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch videos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
        icon: Clock,
      },
      processing: {
        color: "bg-blue-500/20 text-blue-500 border-blue-500/50",
        icon: Clock,
      },
      completed: {
        color: "bg-green-500/20 text-green-500 border-green-500/50",
        icon: CheckCircle,
      },
      failed: {
        color: "bg-red-500/20 text-red-500 border-red-500/50",
        icon: XCircle,
      },
    };
    const variant =
      variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getResultBadge = (
    isDeepfake: boolean | null,
    confidence: number | null
  ) => {
    if (isDeepfake === null)
      return <span className="text-muted-foreground text-sm">-</span>;

    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            isDeepfake
              ? "bg-red-500/20 text-red-500 border-red-500/50"
              : "bg-green-500/20 text-green-500 border-green-500/50"
          }
        >
          {isDeepfake ? (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Deepfake
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Genuine
            </>
          )}
        </Badge>
        {confidence !== null && (
          <span className="text-xs text-muted-foreground">
            {confidence.toFixed(1)}%
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-500" />
            Video Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Filename</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No videos found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVideos.map((video) => (
                    <TableRow key={video.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium max-w-xs truncate">
                        {video.original_filename}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {video.user_name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {video.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(video.file_size)}
                      </TableCell>
                      <TableCell>{getStatusBadge(video.status)}</TableCell>
                      <TableCell>
                        {getResultBadge(
                          video.is_deepfake,
                          video.confidence_score
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(video.uploaded_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
