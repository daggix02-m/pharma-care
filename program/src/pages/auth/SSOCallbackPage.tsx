'use client';

import { Pill } from 'lucide-react';
import { FloatingPaths } from '@/components/shared/FloatingPaths';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function SSOCallbackPage() {
  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute inset-0 isolate contain-strict -z-10 opacity-40'>
        <div className='bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsl(var(--muted))_0,hsla(0,0%,55%,.02)_50%,transparent_80%)] absolute top-0 right-0 h-[800px] w-[350px] -translate-y-1/2 rounded-full' />
        <div className='bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--accent))_0,transparent_100%)] absolute top-0 right-0 h-[800px] w-[150px] [translate:5%_-50%] rounded-full' />
      </div>

      {/* Floating Paths */}
      <div className='absolute inset-0 pointer-events-none'>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className='relative z-10 flex flex-col items-center max-w-sm text-center space-y-6'>
        <div className='w-20 h-20 bg-primary rounded-2xl flex items-center justify-center'>
          <Pill className='w-10 h-10 text-primary-foreground' />
        </div>

        <div className='space-y-2'>
          <h1 className='text-2xl font-bold font-display text-foreground tracking-tight'>
            OAuth Login
          </h1>
          <p className='text-muted-foreground font-medium'>Coming Soon</p>
          <p className='text-sm text-muted-foreground'>
            Google and GitHub login will be available shortly.
          </p>
        </div>

        <Button asChild variant='outline'>
          <Link to='/auth/login'>Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
