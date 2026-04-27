"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileVideo, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UploadPanelProps {
  onFileSelect: (file: File) => Promise<void>
  isAnalyzing: boolean
  onStartAnalysis: () => void
}

export function UploadPanel({ onFileSelect, isAnalyzing, onStartAnalysis }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files?.[0]) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setUploadProgress(0)
    
    // Start upload progress animation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    // Call the onFileSelect handler (which uploads the file)
    await onFileSelect(file)
    
    // Complete the progress
    setUploadProgress(100)
    clearInterval(interval)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  return (
    <div className="glass rounded-2xl p-6 border border-border/50 h-full">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" />
        Upload Your Video
      </h2>

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer",
            isDragging
              ? "border-primary bg-primary/10 glow-blue"
              : "border-border/50 hover:border-primary/50 hover:bg-muted/20",
          )}
        >
          <input
            type="file"
            accept="video/mp4,video/avi,video/mov,video/webm"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileVideo className="h-8 w-8 text-primary" />
            </div>
            <p className="text-foreground font-medium mb-2">Drag and drop your video here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <p className="text-xs text-muted-foreground">Supported: MP4, AVI, MOV, WebM (Max 200 MB)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileVideo className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile} disabled={isAnalyzing}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {uploadProgress < 100 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="text-primary">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : (
            <Button onClick={onStartAnalysis} disabled={isAnalyzing} className="w-full glow-blue" size="lg">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Start Analysis</>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
