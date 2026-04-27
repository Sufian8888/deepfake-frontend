"use client";

import {
  Eye,
  AudioLines,
  Clock,
  FileSearch,
  Fingerprint,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: Eye,
    title: "Visual Manipulation Detection",
    description:
      "Detect facial swaps, morphing, and visual artifacts using deep CNN analysis",
  },
  {
    icon: AudioLines,
    title: "Audio-Lip Sync Analysis",
    description:
      "Identify mismatches between audio and lip movements with temporal correlation",
  },
  {
    icon: Clock,
    title: "Temporal Inconsistency Detection",
    description:
      "Analyze frame-to-frame consistency and optical flow anomalies",
  },
  {
    icon: FileSearch,
    title: "Explainable Heatmaps",
    description:
      "Visualize manipulated regions with GradCAM attention overlays",
  },
  {
    icon: Fingerprint,
    title: "Physiological Signals",
    description:
      "Extract rPPG, blink patterns, and reflection consistency markers",
  },
  {
    icon: Waves,
    title: "Forensic Analysis",
    description:
      "Detect compression artifacts, PRNU patterns, and noise fingerprints",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 relative bg-muted/20 overflow-hidden"
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/20)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/20)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-grid-flow" />

      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />

      <div className="max-w-6xl mx-auto relative">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Comprehensive{" "}
            <span className="text-primary text-glow-blue animate-pulse-glow">
              Detection Features
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Multi-modal analysis covering every aspect of deepfake detection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`glass rounded-2xl p-6 border border-border/50 group transition-all duration-700 cursor-pointer ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              } ${
                hoveredIndex === index
                  ? "scale-105 border-primary/50 shadow-2xl shadow-primary/20"
                  : "hover:scale-102"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
                transformStyle: "preserve-3d",
                perspective: "1000px",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div
                  className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent ${
                    hoveredIndex === index ? "animate-shine" : ""
                  }`}
                />
              </div>

              <div
                className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-all duration-500 ${
                  hoveredIndex === index
                    ? "scale-110 rotate-12 glow-blue"
                    : "group-hover:scale-105"
                }`}
              >
                <feature.icon
                  className={`h-6 w-6 text-primary transition-all duration-500 ${
                    hoveredIndex === index ? "scale-125 rotate-360" : ""
                  }`}
                />
              </div>

              <h3
                className={`text-lg font-semibold mb-2 transition-all duration-300 ${
                  hoveredIndex === index ? "text-primary" : ""
                }`}
              >
                {feature.title}
              </h3>

              <p
                className={`text-sm text-muted-foreground leading-relaxed transition-all duration-300 ${
                  hoveredIndex === index ? "text-foreground/80" : ""
                }`}
              >
                {feature.description}
              </p>

              {/* Bottom Accent Line */}
              <div
                className={`mt-4 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full transition-all duration-500 ${
                  hoveredIndex === index
                    ? "opacity-100 scale-x-100"
                    : "opacity-0 scale-x-0"
                }`}
              />

              {/* Particle Effect on Hover */}
              {hoveredIndex === index && (
                <>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-primary/60 rounded-full animate-particle-1" />
                  <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-primary/40 rounded-full animate-particle-2" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-500/60 rounded-full animate-particle-3" />
                  <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-purple-500/40 rounded-full animate-particle-4" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-flow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(4rem);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          66% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }
          50% {
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.8),
              0 0 30px rgba(59, 130, 246, 0.4);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes rotate-360 {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes particle-1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(20px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(15px, -25px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-20px, 20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-4 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-25px, 15px) scale(0);
            opacity: 0;
          }
        }

        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-shine {
          animation: shine 1s ease-in-out;
        }

        .rotate-360 {
          animation: rotate-360 0.6s ease-out;
        }

        .animate-particle-1 {
          animation: particle-1 1s ease-out forwards;
        }

        .animate-particle-2 {
          animation: particle-2 1.2s ease-out forwards;
        }

        .animate-particle-3 {
          animation: particle-3 1.1s ease-out forwards;
        }

        .animate-particle-4 {
          animation: particle-4 1.3s ease-out forwards;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </section>
  );
}
