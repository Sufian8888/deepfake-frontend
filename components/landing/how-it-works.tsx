"use client";

import { Upload, Cpu, Eye, FileText, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drag and drop your video file for analysis",
  },
  {
    icon: Cpu,
    title: "Analysis",
    description: "AI processes visual, audio, and temporal features",
  },
  {
    icon: Eye,
    title: "Explainable Results",
    description: "View heatmaps, graphs, and anomaly detection",
  },
  {
    icon: FileText,
    title: "Report",
    description: "Download detailed verification report",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [pathProgress, setPathProgress] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          let currentStep = 0;
          const interval = setInterval(() => {
            if (currentStep < steps.length) {
              setActiveStep(currentStep);
              currentStep++;
            } else {
              clearInterval(interval);
            }
          }, 800);
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        if (progress <= 100) {
          setPathProgress(progress);
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            How It{" "}
            <span className="text-primary relative inline-block">
              <span className="relative z-10">Works</span>
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Our advanced pipeline analyzes multiple dimensions of your video to
            detect manipulation
          </p>
        </div>

        <div className="relative">
          <svg
            className="hidden lg:block absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <defs>
              <linearGradient
                id="line-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "rgb(59,130,246)", stopOpacity: 0.8 }}
                />
                <stop
                  offset="50%"
                  style={{ stopColor: "rgb(168,85,247)", stopOpacity: 0.8 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "rgb(59,130,246)", stopOpacity: 0.8 }}
                />
              </linearGradient>
            </defs>
            <line
              x1="12.5%"
              y1="50%"
              x2="87.5%"
              y2="50%"
              stroke="url(#line-gradient)"
              strokeWidth="3"
              strokeDasharray="1000"
              strokeDashoffset={1000 - pathProgress * 10}
            />
            {isVisible && (
              <>
                <circle
                  cx="12.5%"
                  cy="50%"
                  r="5"
                  fill="rgb(59,130,246)"
                  className="animate-pulse"
                />
                <circle
                  cx="37.5%"
                  cy="50%"
                  r="5"
                  fill="rgb(59,130,246)"
                  className="animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                />
                <circle
                  cx="62.5%"
                  cy="50%"
                  r="5"
                  fill="rgb(59,130,246)"
                  className="animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                />
                <circle
                  cx="87.5%"
                  cy="50%"
                  r="5"
                  fill="rgb(59,130,246)"
                  className="animate-pulse"
                  style={{ animationDelay: "0.9s" }}
                />
              </>
            )}
          </svg>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
            style={{ zIndex: 2 }}
          >
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`relative group transition-all duration-700 ${
                  activeStep >= index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${index * 200}ms`,
                }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div
                  className={`glass rounded-2xl p-6 border-2 transition-all duration-500 h-full relative overflow-hidden ${
                    hoveredStep === index
                      ? "border-primary shadow-2xl shadow-primary/30 scale-105"
                      : "border-border/50"
                  }`}
                  style={{
                    transform:
                      hoveredStep === index ? "rotateY(5deg)" : "rotateY(0deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent transition-opacity duration-500 ${
                      hoveredStep === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {hoveredStep === index && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                    </div>
                  )}
                  <div className="mb-4 relative">
                    <div className="relative w-14 h-14 mx-auto lg:mx-0">
                      <svg
                        className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                          hoveredStep === index
                            ? "rotate-180 scale-110"
                            : "rotate-0"
                        }`}
                        viewBox="0 0 100 100"
                      >
                        <defs>
                          <linearGradient
                            id={`hex-grad-${index}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              style={{
                                stopColor: "rgb(59,130,246)",
                                stopOpacity: 0.3,
                              }}
                            />
                            <stop
                              offset="100%"
                              style={{
                                stopColor: "rgb(168,85,247)",
                                stopOpacity: 0.3,
                              }}
                            />
                          </linearGradient>
                        </defs>
                        <polygon
                          points="50 1 95 25 95 75 50 99 5 75 5 25"
                          fill={`url(#hex-grad-${index})`}
                          stroke="rgb(59,130,246)"
                          strokeWidth="2"
                          className={
                            hoveredStep === index ? "animate-pulse" : ""
                          }
                        />
                      </svg>
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                          hoveredStep === index ? "scale-125" : "scale-100"
                        }`}
                      >
                        <step.icon
                          className="h-7 w-7 text-primary transition-all duration-500"
                          style={{
                            filter:
                              hoveredStep === index
                                ? "drop-shadow(0 0 8px rgb(59,130,246))"
                                : "none",
                          }}
                        />
                      </div>
                      {hoveredStep === index && (
                        <svg
                          className="absolute inset-0 w-full h-full animate-spin-slow"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgb(59,130,246)"
                            strokeWidth="1"
                            strokeDasharray="5 5"
                            opacity="0.5"
                          />
                        </svg>
                      )}
                    </div>
                    <div
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                        activeStep >= index
                          ? "bg-gradient-to-br from-primary to-purple-500 text-white scale-100"
                          : "bg-muted text-muted-foreground scale-0"
                      } ${hoveredStep === index ? "scale-125 rotate-360" : ""}`}
                      style={{
                        transitionDelay: `${index * 200 + 400}ms`,
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <h3
                    className={`text-lg font-semibold mb-2 text-center lg:text-left transition-all duration-300 ${
                      hoveredStep === index ? "text-primary" : ""
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm text-center lg:text-left transition-all duration-300 ${
                      hoveredStep === index
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.description}
                  </p>
                  <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ${
                        activeStep >= index ? "w-full" : "w-0"
                      }`}
                      style={{
                        transitionDelay: `${index * 200 + 600}ms`,
                      }}
                    />
                  </div>
                  {hoveredStep === index && (
                    <>
                      <div className="absolute top-4 left-4 w-1 h-1 bg-primary rounded-full animate-ping" />
                      <div
                        className="absolute top-8 right-8 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="absolute bottom-6 left-6 w-1 h-1 bg-blue-400 rounded-full animate-ping"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div
                      className={`relative ${
                        activeStep > index ? "animate-pulse" : ""
                      }`}
                    >
                      <ArrowRight
                        className={`h-6 w-6 transition-all duration-500 ${
                          activeStep > index
                            ? "text-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                      {activeStep > index && (
                        <div className="absolute inset-0 animate-ping">
                          <ArrowRight className="h-6 w-6 text-primary opacity-75" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% {
            top: 0%;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        @keyframes rotate-360 {
          from {
            transform: rotate(0deg) scale(1.25);
          }
          to {
            transform: rotate(360deg) scale(1.25);
          }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        .rotate-360 {
          animation: rotate-360 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}
