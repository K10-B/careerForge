"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useAnimatedThemeToggle } from "@/lib/use-animated-theme-toggle";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useAnimatedThemeToggle();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLabel = !mounted ? "Toggle theme" : isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={toggleLabel}
      type="button"
      className="relative h-12 w-12 overflow-hidden rounded-full border-0 bg-transparent shadow-none hover:bg-transparent hover:shadow-none dark:hover:bg-transparent"
    >
      <Image
        src="/theme-sun.png"
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        className={`absolute h-5 w-5 transition-all duration-200 ${
          mounted && isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <Image
        src="/theme-moon.png"
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        className={`absolute h-5 w-5 transition-all duration-200 ${
          !mounted || !isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <span className="sr-only">{toggleLabel}</span>
    </Button>
  );
}
