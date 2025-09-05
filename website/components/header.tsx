"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

export function Header() {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-8">
        <Image
          src={resolvedTheme === "dark" ? "/logo_dark.png" : "/logo.png"}
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
