"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch: only render the icon after mount
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : null;
  const isDark = current === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
    >
      {mounted ? (
        isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
