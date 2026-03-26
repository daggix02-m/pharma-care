import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface ElegantShapeProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-blue-500/[0.08]',
}: ElegantShapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !shapeRef.current) return;

    // Initial animation
    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      },
      {
        opacity: 1,
        y: 0,
        rotate: rotate,
        duration: 2.4,
        delay,
        ease: 'power2.out',
      }
    );

    // Continuous floating animation
    gsap.to(shapeRef.current, {
      y: [0, 15, 0] as unknown as gsap.TweenValue,
      duration: 12,
      repeat: -1,
      ease: 'sine.inOut',
      yoyo: true,
    });

    return () => {
      gsap.killTweensOf(containerRef.current);
      gsap.killTweensOf(shapeRef.current);
    };
  }, [delay, rotate]);

  return (
    <div ref={containerRef} className={cn('absolute', className)}>
      <div
        ref={shapeRef}
        style={{
          width,
          height,
        }}
        className='relative'
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r to-transparent',
            gradient,
            'backdrop-blur-[2px] border-2 border-blue-200/[0.3]',
            'shadow-[0_8px_32px_0_rgba(59,130,246,0.15)]',
            'after:absolute after:inset-0 after:rounded-full',
            'after:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]'
          )}
        />
      </div>
    </div>
  );
}

export default ElegantShape;
