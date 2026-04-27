'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadAPI, predictionsAPI } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, Eye, Trash2, Play, CheckCircle, XCircle, Clock, AlertTriangle, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface VideoData {
  id: number
  filename: string
  original_filename: string
  file_size: number
  file_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  is_deepfake: boolean | null
  confidence_score: number | null
  uploaded_at: string
  processed_at?: string
}

export function UserVideos() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null)
  const [analyzingId, setAnalyzingId] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const data = await uploadAPI.listFiles()
      setVideos(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch videos',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteVideoId) return

    try {
      await uploadAPI.deleteFile(deleteVideoId)
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      })
      fetchVideos()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      })
    } finally {
      setDeleteVideoId(null)
    }
  }

  const handleAnalyze = async (videoId: number) => {
    setAnalyzingId(videoId)
    try {
      await predictionsAPI.startAnalysis(videoId)
      toast({
        title: 'Analysis Started',
        description: 'Your video is being analyzed',
      })
      // Refresh the list after a short delay
      setTimeout(fetchVideos, 1000)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to start analysis',
        variant: 'destructive',
      })
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleViewReport = (videoId: number) => {
    router.push(`/analysis?videoId=${videoId}`)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50', icon: Clock, label: 'Pending' },
      processing: { color: 'bg-blue-500/20 text-blue-500 border-blue-500/50', icon: Clock, label: 'Processing' },
      completed: { color: 'bg-green-500/20 text-green-500 border-green-500/50', icon: CheckCircle, label: 'Completed' },
      failed: { color: 'bg-red-500/20 text-red-500 border-red-500/50', icon: XCircle, label: 'Failed' },
    }
    const variant = variants[status as keyof typeof variants] || variants.pending
    const Icon = variant.icon

    return (
      <Badge variant="outline" className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    )
  }

  const getResultBadge = (isDeepfake: boolean | null, confidence: number | null) => {
    if (isDeepfake === null) return <span className="text-muted-foreground text-sm">-</span>

    return (
      <div className="flex flex-col gap-1">
        <Badge
          variant="outline"
          className={
            isDeepfake
              ? 'bg-red-500/20 text-red-500 border-red-500/50'
              : 'bg-green-500/20 text-green-500 border-green-500/50'
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
          <span className="text-xs text-muted-foreground">Confidence: {confidence.toFixed(1)}%</span>
        )}
      </div>
    )
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          My Videos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No videos uploaded yet</p>
            <Button onClick={() => router.push('/upload')} className="glow-blue">
              Upload Your First Video
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Filename</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium max-w-xs truncate">
                      {video.original_filename}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(video.file_size)}
                    </TableCell>
                    <TableCell>{getStatusBadge(video.status)}</TableCell>
                    <TableCell>{getResultBadge(video.is_deepfake, video.confidence_score)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(video.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {video.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnalyze(video.id)}
                            disabled={analyzingId === video.id}
                            className="border-primary/50 hover:bg-primary/10"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {analyzingId === video.id ? 'Starting...' : 'Analyze'}
                          </Button>
                        )}
                        {video.status === 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => handleViewReport(video.id)}
                            className="glow-blue"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Analysis
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteVideoId(video.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteVideoId !== null} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent className="glass border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video and all associated analysis data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
