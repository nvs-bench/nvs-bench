"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function Header() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a default logo during SSR and initial render to prevent hydration mismatch
  const logoSrc = mounted && resolvedTheme === "dark" ? "/logo_dark.png" : "/logo.png";
  
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-4">
        <Image
          src={logoSrc}
          alt="nvs-bench logo"
          width={300}
          height={120}
          className="h-24 w-auto"
        />
      </div>

      <div className="flex justify-center mb-8">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-2 rounded-full px-6"
        >
          <a
            href="https://github.com/nvs-bench/nvs-bench"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-5 w-5" />
            GitHub
          </a>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto text-lg text-foreground leading-relaxed">
        <p className="mb-4">
        <strong>nvs-bench</strong> is a standardized and easily reproducible novel view synthesis (3D Gaussian Splats, NeRFs etc…) benchmark that anyone can setup on a new method in <strong>~5 minutes</strong> and <strong>~10 lines of code</strong>. It started from the following observations: The NVS research community commonly evaluates on the same datasets, but these datasets have different sourcing and preprocessing steps. All methods expect the same input format and can output rendered images. And, rendered images are all you need for evaluation.
        </p>
        
        <p>
          See <a href="https://github.com/nvs-bench/nvs-bench" className="underline underline-offset-4 hover:text-foreground">README.md</a> to add a new method.
        </p>
      </div>
    </div>
  );
}
