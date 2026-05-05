"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What video formats are supported?",
    answer:
      "We support MP4, MOV, AVI, and WebM formats. Maximum file size is 500MB. Videos can be up to 10 minutes in length.",
  },
  {
    question: "How accurate is the detection?",
    answer:
      "Our system achieves 99.2% accuracy across multiple detection methods. However, results should be considered as evidence, not definitive proof.",
  },
  {
    question: "How long does analysis take?",
    answer:
      "Most videos are analyzed in under 2 seconds. Processing time depends on video length and quality. Longer videos may take 5-30 seconds.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Yes, all uploaded videos are processed securely and deleted after analysis. We never store or share your content with third parties.",
  },
  {
    question: "Can I download the report?",
    answer:
      "Yes, you can download a detailed PDF report including heatmaps, confidence scores, and technical analysis for your records.",
  },
  {
    question: "What makes the results explainable?",
    answer:
      "We use GradCAM heatmaps, attention visualizations, and detailed anomaly reports to show exactly where and why manipulations were detected.",
  },
];

export function FaqSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/20)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/20)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/2 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto relative">
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full glass rounded-lg p-4 sm:p-5 border border-border/50 hover:border-primary/30 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base sm:text-lg">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {openIndex === index && (
                  <div className="mt-4 pt-4 border-t border-border/50 text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
