import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface LabBackgroundProps {
  className?: string;
}

export function LabBackground({ className }: LabBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dotsRef.current) return;

    const ctx = gsap.context(() => {
      // Entrance animation: expand ripple from center
      gsap.fromTo(
        dotsRef.current,
        {
          clipPath: 'circle(0% at 50% 50%)',
          opacity: 0,
        },
        {
          clipPath: 'circle(150% at 50% 50%)',
          opacity: 1,
          duration: 0.4,
          ease: 'power4.out',
          immediateRender: true,
        }
      );

      // Subtle idle movement
      gsap.to(dotsRef.current, {
        x: '+=5',
        y: '+=5',
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
    >
      <div className='absolute inset-0 lab-bg'>
        <div
          ref={dotsRef}
          className='absolute inset-0 lab-bg-dots'
          style={{ width: '105%', height: '105%', left: '-2.5%', top: '-2.5%' }}
        />
      </div>
    </div>
  );
}
