import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Clock } from 'lucide-react';

interface OAuthButtonsProps {
  mode: 'login' | 'signup';
}

export function OAuthButtons({ mode }: OAuthButtonsProps) {
  return (
    <div className='space-y-4'>
      {/* Google OAuth - Coming Soon */}
      <div className='relative group'>
        <Button
          type='button'
          size='lg'
          variant='outline'
          disabled
          className='w-full h-12 bg-muted/50 border-input opacity-60 cursor-not-allowed'
        >
          <GoogleIcon className='mr-3 h-5 w-5 opacity-50' />
          <span className='text-muted-foreground'>
            {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          </span>
          <Lock className='ml-2 h-4 w-4 text-muted-foreground' />
        </Button>
      </div>

      {/* GitHub OAuth - Coming Soon */}
      <div className='relative group'>
        <Button
          type='button'
          size='lg'
          variant='outline'
          disabled
          className='w-full h-12 bg-muted/50 border-input opacity-60 cursor-not-allowed'
        >
          <GithubIcon className='mr-3 h-5 w-5 opacity-50' />
          <span className='text-muted-foreground'>
            {mode === 'login' ? 'Sign in with GitHub' : 'Sign up with GitHub'}
          </span>
          <Lock className='ml-2 h-4 w-4 text-muted-foreground' />
        </Button>
      </div>

      {/* Apple OAuth - Coming Soon */}
      <div className='relative group'>
        <Button
          type='button'
          size='lg'
          variant='outline'
          disabled
          className='w-full h-12 bg-muted/50 border-input opacity-60 cursor-not-allowed'
        >
          <AppleIcon className='mr-3 h-5 w-5 opacity-50' />
          <span className='text-muted-foreground'>
            {mode === 'login' ? 'Sign in with Apple' : 'Sign up with Apple'}
          </span>
          <Lock className='ml-2 h-4 w-4 text-muted-foreground' />
        </Button>
      </div>

      {/* Coming Soon Banner - PharmaCare Theme */}
      <div className='relative mt-4 p-4 bg-secondary/20 border border-secondary/30 rounded-xl'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-secondary rounded-lg'>
            <Clock className='h-5 w-5 text-secondary-foreground' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-semibold text-secondary-foreground'>
              Social Login Coming Soon
            </p>
            <p className='text-xs text-secondary-foreground/70 mt-0.5'>
              We're working on adding Google, GitHub, and Apple authentication. Stay tuned for
              updates!
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className='absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse' />
      </div>

      {/* Alternative divider */}
      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-border' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-card px-2 text-muted-foreground font-medium'>
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' {...props}>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
      <path d='M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.494 3.62-2.948 1.156-1.689 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z' />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
      />
    </svg>
  );
}
