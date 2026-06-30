'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadAPI, predictionsAPI } from '@/lib/api'
import { useAnalysisCache } from '@/lib/stores/analysis-cache'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Video, Eye, Trash2, Play, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
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

const PAGE_SIZE = 10

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

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
}

export function UserVideos() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [totalVideos, setTotalVideos] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null)
  const [analyzingId, setAnalyzingId] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const prefetchCompletedVideos = useAnalysisCache((state) => state.prefetchCompletedVideos)
  const prefetchVideo = useAnalysisCache((state) => state.prefetchVideo)
  const invalidateVideo = useAnalysisCache((state) => state.invalidateVideo)

  const totalPages = Math.max(1, Math.ceil(totalVideos / PAGE_SIZE))

  const fetchVideos = useCallback(async (page = currentPage, showLoading = false) => {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      const skip = (page - 1) * PAGE_SIZE
      const data = await uploadAPI.listFiles(skip, PAGE_SIZE)
      const items = Array.isArray(data?.items) ? data.items : []
      const total = typeof data?.total === 'number' ? data.total : items.length

      setVideos(items)
      setTotalVideos(total)
      prefetchCompletedVideos(items)

      const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
      if (page > maxPage) {
        setCurrentPage(maxPage)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch videos',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, toast, prefetchCompletedVideos])

  useEffect(() => {
    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    const refreshVideos = async () => {
      try {
        const skip = (currentPage - 1) * PAGE_SIZE
        const data = await uploadAPI.listFiles(skip, PAGE_SIZE)
        if (!isMounted) return

        const items = Array.isArray(data?.items) ? data.items : []
        const total = typeof data?.total === 'number' ? data.total : items.length

        setVideos(items)
        setTotalVideos(total)
        prefetchCompletedVideos(items)

        const hasProcessing = items.some(
          (video: VideoData) => video.status === 'processing' || video.status === 'pending'
        )

        if (hasProcessing && !intervalId) {
          intervalId = setInterval(refreshVideos, 8000)
        }
        if (!hasProcessing && intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to fetch videos',
            variant: 'destructive',
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    setIsLoading(true)
    refreshVideos()

    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [currentPage, toast, prefetchCompletedVideos])

  const handleDelete = async () => {
    if (!deleteVideoId) return

    try {
      await uploadAPI.deleteFile(deleteVideoId)
      invalidateVideo(deleteVideoId)
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      })

      const nextPage =
        videos.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage)
      } else {
        await fetchVideos(currentPage)
      }
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
      setTimeout(() => fetchVideos(currentPage), 1000)
      setTimeout(() => fetchVideos(currentPage), 6000)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to start analysis'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleViewReport = async (videoId: number) => {
    await prefetchVideo(videoId)
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

  const getResultBadge = (isDeepfake: boolean | null) => {
    if (isDeepfake === null) return <span className="text-muted-foreground text-sm">-</span>

    return (
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
    )
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages)
  const rangeStart = totalVideos === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalVideos)

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
        ) : totalVideos === 0 ? (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No videos uploaded yet</p>
            <Button onClick={() => router.push('/upload')} className="glow-blue">
              Upload Your First Video
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table className="min-w-[720px]">
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
                      <TableCell>{getResultBadge(video.is_deepfake)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(video.uploaded_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {video.status === 'pending' && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleAnalyze(video.id)}
                              disabled={analyzingId === video.id}
                              className="h-8 w-8 border-primary/50 hover:bg-primary/10"
                              title={analyzingId === video.id ? 'Starting analysis...' : 'Analyze'}
                              aria-label={analyzingId === video.id ? 'Starting analysis' : 'Analyze video'}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {video.status === 'completed' && (
                            <Button
                              size="icon"
                              onClick={() => handleViewReport(video.id)}
                              className="h-8 w-8 glow-blue"
                              title="View analysis"
                              aria-label="View analysis"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {video.status === 'processing' && (
                            <Button
                              size="icon"
                              variant="outline"
                              disabled
                              className="h-8 w-8 border-blue-500/50 text-blue-500 bg-blue-500/10"
                              title="Processing"
                              aria-label="Processing"
                            >
                              <Clock className="h-4 w-4" />
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart}–{rangeEnd} of {totalVideos} videos
              </p>

              {totalPages > 1 ? (
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          if (currentPage > 1) {
                            setCurrentPage((page) => page - 1)
                          }
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {pageNumbers.map((page, index) => {
                      const previousPage = pageNumbers[index - 1]
                      const showEllipsis = previousPage && page - previousPage > 1

                      return (
                        <span key={page} className="contents">
                          {showEllipsis ? (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : null}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(event) => {
                                event.preventDefault()
                                setCurrentPage(page)
                              }}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </span>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          if (currentPage < totalPages) {
                            setCurrentPage((page) => page + 1)
                          }
                        }}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          </>
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
