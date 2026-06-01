import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: getSystemTheme(),
      setTheme: (theme) => {
        const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
        set({ theme, resolvedTheme });
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        set({ theme: newTheme, resolvedTheme: newTheme });
      },
    }),
    {
      name: "pharmacare-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolvedTheme =
            state.theme === "system" ? getSystemTheme() : state.theme;
          state.resolvedTheme = resolvedTheme;
        }
      },
    },
  ),
);
