"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
      <div className="flex items-center justify-center mb-8">
        <Image
          src={logoSrc}
          alt="nvs-bench logo"
          width={300}
          height={120}
          className="h-24 w-auto"
        />
      </div>

      <div className="max-w-4xl mx-auto text-lg text-foreground leading-relaxed">
        Some text explaining what this is
      </div>
    </div>
  );
}
