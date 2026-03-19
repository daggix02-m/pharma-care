import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FloatingPaths({ position }) {
  const containerRef = useRef(null);

  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const svgPaths = containerRef.current.querySelectorAll('path');

    svgPaths.forEach((path) => {
      const length = path.getTotalLength();
      
      // Initialize matching Framer Motion's starting points in the loop
      gsap.set(path, {
        strokeDasharray: `${length * 0.3} ${length}`,
        strokeDashoffset: 0,
        opacity: 0.3,
      });

      const duration = 20 + Math.random() * 10;

      // Create a timeline that repeats infinitely
      const tl = gsap.timeline({ repeat: -1, ease: 'none' });
      
      // Animate pathLength from 0.3 to 1 over the full duration
      tl.to(path, {
        strokeDasharray: `${length} ${length}`,
        duration: duration,
        ease: 'none'
      }, 0);

      // Animate pathOffset from 0 to 1 (which translates to -length) and back
      tl.to(path, {
        strokeDashoffset: -length,
        duration: duration / 2,
        yoyo: true,
        repeat: 1,
        ease: 'none'
      }, 0);

      // Animate opacity from 0.3 to 0.6 and back
      tl.to(path, {
        opacity: 0.6,
        duration: duration / 2,
        yoyo: true,
        repeat: 1,
        ease: 'none'
      }, 0);
    });

    return () => {
      svgPaths.forEach((path) => gsap.killTweensOf(path));
    };
  }, []);

  return (
    <div ref={containerRef} className='pointer-events-none absolute inset-0'>
      <svg
        className='h-full w-full text-slate-950 dark:text-white'
        viewBox='0 0 696 316'
        fill='none'
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke='currentColor'
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
          />
        ))}
      </svg>
    </div>
  );
}
