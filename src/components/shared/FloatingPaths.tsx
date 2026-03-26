import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function FloatingPaths({ position }: { position: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Primary paths (20) - branded color (brown in light, golden in dark)
  const primaryPaths = Array.from({ length: 20 }, (_i, i) => ({
    id: `p-${i}`,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.8 + i * 0.04,
    opacity: 0.5 + i * 0.008, // 50-66% opacity (more visible in light)
    isPrimary: true,
  }));

  // Secondary paths (16) - cream accent
  const secondaryPaths = Array.from({ length: 16 }, (_i, i) => ({
    id: `s-${i}`,
    d: `M-${360 - i * 6 * position} -${169 + i * 7}C-${
      360 - i * 6 * position
    } -${169 + i * 7} -${292 - i * 6 * position} ${236 - i * 7} ${
      172 - i * 6 * position
    } ${363 - i * 7}C${636 - i * 6 * position} ${490 - i * 7} ${
      704 - i * 6 * position
    } ${895 - i * 7} ${704 - i * 6 * position} ${895 - i * 7}`,
    width: 0.9 + i * 0.04,
    opacity: 0.45 + i * 0.009, // 45-59% opacity (more visible in light)
    isPrimary: false,
  }));

  const paths = [...primaryPaths, ...secondaryPaths];

  useEffect(() => {
    if (!containerRef.current) return;
    const svgPaths = containerRef.current.querySelectorAll('path');

    svgPaths.forEach((path) => {
      const length = path.getTotalLength();

      gsap.set(path, {
        strokeDasharray: `${length * 0.3} ${length}`,
        strokeDashoffset: 0,
        opacity: 0.5,
      });

      // Slower animation - 30-45 seconds (user requested slower)
      const duration = 30 + Math.random() * 15;
      const tl = gsap.timeline({ repeat: -1, ease: 'none' });

      tl.to(
        path,
        {
          strokeDasharray: `${length} ${length}`,
          duration: duration,
          ease: 'none',
        },
        0
      );

      tl.to(
        path,
        {
          strokeDashoffset: -length,
          duration: duration / 2,
          yoyo: true,
          repeat: 1,
          ease: 'none',
        },
        0
      );

      tl.to(
        path,
        {
          opacity: 0.8,
          duration: duration / 2,
          yoyo: true,
          repeat: 1,
          ease: 'none',
        },
        0
      );
    });

    return () => {
      svgPaths.forEach((path) => gsap.killTweensOf(path));
    };
  }, []);

  // Get color based on theme
  const getPathColor = (path: { isPrimary: boolean }): string => {
    if (path.isPrimary) {
      // Light theme: Brown #644a40, Dark theme: Golden #ffe0c2
      return isDark ? 'hsl(33 100% 88%)' : 'hsl(16 22% 32%)';
    } else {
      // Light theme: Cream #ffdfb5, Dark theme: Lighter cream
      return isDark ? 'hsl(33 100% 92%)' : 'hsl(35 100% 86%)';
    }
  };

  return (
    <div ref={containerRef} className='pointer-events-none absolute inset-0 overflow-hidden'>
      <svg
        className='h-full w-full'
        viewBox='0 0 696 316'
        preserveAspectRatio='xMidYMid slice'
        fill='none'
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke={getPathColor(path)}
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            strokeLinecap='round'
          />
        ))}
      </svg>
    </div>
  );
}
