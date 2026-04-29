"use client";

import { Suspense } from "react";
import { AnalysisPageContent } from "./analysis-content";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalysisPageContent />
    </Suspense>
  );
}
