import { PublicNavbar } from "@/components/ui/public-navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, Target, Zap } from "lucide-react";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/30)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/30)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            About{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">
              This Project
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Building explainable AI for deepfake detection through comprehensive
            multimodal analysis
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/20)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/20)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="max-w-4xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
                Our <span className="text-primary">Mission</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                In an era where AI-generated content is becoming increasingly
                sophisticated, we're committed to building transparent,
                explainable detection systems that empower users to verify media
                authenticity.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                This project combines cutting-edge deep learning techniques with
                interpretable AI to not just detect deepfakes, but to explain
                exactly where and why manipulations were found.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Target,
                  title: "Accuracy",
                  description: "99.2% detection rate",
                },
                {
                  icon: Zap,
                  title: "Speed",
                  description: "Sub-2 second analysis",
                },
                {
                  icon: Award,
                  title: "Explainability",
                  description: "Visual & technical insights",
                },
                {
                  icon: Users,
                  title: "Privacy",
                  description: "No data retention",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="glass rounded-lg p-6 border border-border/50 text-center"
                >
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Approach */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-balance">
            Technical <span className="text-primary">Approach</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Visual Analysis",
                description:
                  "Deep CNN-based facial manipulation detection using XceptionNet and EfficientNet architectures",
              },
              {
                title: "Audio Analysis",
                description:
                  "Lip-sync verification and audio consistency checking using spectrogram analysis",
              },
              {
                title: "Temporal Analysis",
                description:
                  "Optical flow computation and frame consistency detection across video sequences",
              },
              {
                title: "Physiological Signals",
                description:
                  "rPPG extraction, blink pattern analysis, and facial reflection consistency metrics",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="glass rounded-lg p-6 sm:p-8 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-balance">
            Key <span className="text-primary">Innovations</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Explainable Results",
                description:
                  "GradCAM heatmaps and attention visualizations show exactly which regions triggered detection",
              },
              {
                title: "Multi-Modal Fusion",
                description:
                  "Combines visual, audio, and motion analysis for robust detection across manipulation types",
              },
              {
                title: "Real-Time Processing",
                description:
                  "Optimized inference pipeline processes videos in under 2 seconds on standard hardware",
              },
              {
                title: "Privacy-First Design",
                description:
                  "Videos are processed and immediately discarded, with no storage or data sharing",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="glass rounded-lg p-6 sm:p-8 border border-border/50"
              >
                <h3 className="text-lg font-semibold mb-3 text-primary">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto glass rounded-2xl border border-primary/30 p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Ready to Test Our System?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 text-balance max-w-2xl mx-auto">
            Experience the power of explainable deepfake detection with our
            advanced analysis tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/upload">
              <Button size="lg" className="glow-blue group">
                <span>Start Analysis</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="glass border-primary/30">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
