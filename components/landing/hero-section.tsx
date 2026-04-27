"use client";

import { Button } from "@/components/ui/button";
import { Upload, Play, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[url('/brain-pattern.png')] opacity-10 bg-cover bg-center" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/30)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/30)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 mt-10 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
          <span className="text-glow-blue">Explainable Multimodal</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">
            DeepFake Verification
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance leading-relaxed">
          Upload a video and detect AI-generated or manipulated content with
          visual, audio, and motion explanations. Powered by cutting-edge
          machine learning algorithms.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">
            AI-Powered Detection
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/upload">
            <Button size="lg" className="glow-blue animate-pulse-glow group">
              <Upload className="mr-2 h-5 w-5" />
              Upload Video
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="glass border-primary/30 bg-transparent"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto">
          {[
            { value: "99.2%", label: "Detection Accuracy" },
            { value: "50K+", label: "Videos Analyzed" },
            { value: "<2s", label: "Processing Time" },
            { value: "15+", label: "Detection Methods" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-4 border border-border/50"
            >
              <div className="text-2xl sm:text-3xl font-bold text-primary text-glow-blue">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
