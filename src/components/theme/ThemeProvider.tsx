import * as React from 'react';
import { useThemeStore } from '@/store/useThemeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  // Apply theme class on mount and theme change
  React.useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the resolved theme class
    root.classList.add(resolvedTheme);

    // Update color-scheme meta tag for browser UI
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.setAttribute('content', resolvedTheme);
    }
  }, [resolvedTheme]);

  // Listen for system theme changes when in system mode
  React.useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return <>{children}</>;
}
