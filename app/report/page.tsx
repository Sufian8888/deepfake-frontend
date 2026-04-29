"use client";

import { Suspense } from "react";
import { ReportPageContent } from "./report-content";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReportPageContent />
    </Suspense>
  );
}
