import { PublicNavbar } from "@/components/ui/public-navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Shield,
  Video,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 glow-blue">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-primary text-glow-blue">Documentation</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn how to use our deepfake detection system to analyze videos
              and identify AI-generated content
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* What is DeepFake Detection */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  What is DeepFake Detection?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  DeepFake Detection is an AI-powered system that analyzes
                  videos to determine if they have been manipulated or generated
                  using artificial intelligence. Our system uses advanced
                  machine learning algorithms to detect subtle inconsistencies
                  that are invisible to the human eye.
                </p>
                <p>
                  The system analyzes multiple aspects of the video including
                  facial movements, audio synchronization, lighting patterns,
                  and temporal consistency to provide a comprehensive analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 mt-1">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Upload Your Video</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload the video file you want to analyze. We support
                        MP4, AVI, and MOV formats.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 mt-1">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">AI Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Our system analyzes the video using multiple detection
                        models including facial consistency, audio-visual
                        synchronization, and temporal coherence analysis.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 mt-1">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Get Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive a detailed report with confidence scores, visual
                        explanations, and specific areas of concern if deepfake
                        manipulation is detected.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Understanding Results */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-500" />
                  Understanding Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-green-500">
                        Genuine Video
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        The video appears to be authentic with no signs of AI
                        manipulation. High confidence scores (above 85%)
                        indicate strong certainty.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-red-500">
                        Deepfake Detected
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        The video shows signs of AI manipulation. The report
                        will highlight specific frames and areas where
                        inconsistencies were detected.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2">Confidence Score</h4>
                  <p className="text-sm text-muted-foreground">
                    The confidence score (0-100%) indicates how certain the
                    system is about its prediction. Higher scores mean higher
                    confidence in the result.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Getting Started */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>To start using the DeepFake Detection system:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Create an account by clicking "Get Started"</li>
                  <li>Login to your dashboard</li>
                  <li>Upload a video file for analysis</li>
                  <li>
                    Wait for the analysis to complete (usually 1-5 minutes)
                  </li>
                  <li>View your detailed report with results</li>
                </ol>
                <p className="mt-4">
                  Need help? Contact our support team or check out our video
                  tutorials.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
