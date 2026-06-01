import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = React.memo(function ThemeToggle({
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "h-9 w-9 relative overflow-hidden transition-colors duration-200",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all duration-300",
          isDark
            ? "opacity-0 rotate-90 scale-0"
            : "opacity-100 rotate-0 scale-100",
        )}
      />
      <Moon
        className={cn(
          "h-[1.2rem] w-[1.2rem] absolute transition-all duration-300",
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0",
        )}
      />
    </Button>
  );
});

export default ThemeToggle;
