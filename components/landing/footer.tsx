import Link from "next/link";
import { Brain, Github, Mail, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          &copy; 2025 DeepFake Detection System. Final Year Project.
        </p>
      </div>
    </footer>
  );
}
