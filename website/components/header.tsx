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
          variant="default"
          size="sm"
          asChild
          className="gap-2 bg-black hover:bg-gray-800 text-white border border-gray-700 rounded-full px-6"
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

      <div className="max-w-4xl mx-auto text-lg text-foreground leading-relaxed">
        Some text explaining what this is
      </div>
    </div>
  );
}
