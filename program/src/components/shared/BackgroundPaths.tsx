import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { FloatingPaths } from './FloatingPaths';

export function BackgroundPaths({
  title = 'Modern Healthcare Management',
  description = 'Streamline your pharmacy operations with our high-performance layer for contemporary medical orchestration.',
  onActionClick,
}: {
  title?: string;
  description?: string;
  onActionClick?: () => void;
}) {
  const words = title.split(' ');
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const letters = titleRef.current?.querySelectorAll('.letter');

      if (!letters || letters.length === 0) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
      });

      tl.fromTo(
        letters,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.015,
          duration: 0.8,
          immediateRender: true,
        }
      )
        .fromTo(
          descriptionRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.5'
        )
        .fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5 },
          '-=0.4'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent'
    >
      <div className='absolute inset-0 z-0'>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className='relative z-10 container mx-auto px-4 md:px-6 text-center'>
        <div className='max-w-4xl mx-auto'>
          <h1
            ref={titleRef}
            className='text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter font-display text-foreground leading-[1.1]'
          >
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className='inline-block mr-4 last:mr-0 whitespace-nowrap'>
                {word.split('').map((letter, letterIndex) => (
                  <span key={`${wordIndex}-${letterIndex}`} className='letter inline-block'>
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p
            ref={descriptionRef}
            className='text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-body leading-relaxed'
          >
            {description}
          </p>

          <div ref={buttonRef} className='inline-block'>
            <Button
              onClick={onActionClick}
              className='rounded-xl px-10 py-7 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 border border-border shadow-sm active:scale-[0.98]'
            >
              <span className='opacity-90 transition-opacity'>Discover Excellence</span>
              <span className='ml-3 transition-transform group-hover:translate-x-1'>→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
