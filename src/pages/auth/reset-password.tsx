'use client';

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeftIcon, LockIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/components/shared/AuthLayout';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);

      toast.success('Password reset successfully! Please sign in with your new password.');
      window.location.href = '/auth/login';
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <Button
          variant='ghost'
          className='absolute -top-12 left-0 sm:-top-16 sm:-left-4 lg:hidden'
          asChild
        >
          <Link
            to='/auth/login'
            className='text-muted-foreground hover:text-foreground font-semibold font-body text-sm'
          >
            <ChevronLeftIcon className='size-4 me-2' />
            Back to Login
          </Link>
        </Button>

        <div className='flex flex-col space-y-2 text-left mt-8'>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground'>
            Reset Password
          </h1>
          <p className='text-muted-foreground font-body text-sm font-medium'>
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1.5'>
            <Label className='text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest'>
              New Password
            </Label>
            <div className='relative'>
              <Input
                placeholder='Enter new password'
                className={cn(
                  'h-12 ps-11 pr-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                  error && error.includes('Password') ? 'border-destructive' : ''
                )}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <LockIcon className='size-4' />
              </div>
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none'
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
              </button>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest'>
              Confirm New Password
            </Label>
            <div className='relative'>
              <Input
                placeholder='Confirm new password'
                className={cn(
                  'h-12 ps-11 pr-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                  error && error.includes('match') ? 'border-destructive' : ''
                )}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <LockIcon className='size-4' />
              </div>
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none'
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
              </button>
            </div>
          </div>

          {error && (
            <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2'>
              <div className='h-1 w-1 rounded-full bg-destructive' />
              {error}
            </div>
          )}

          {success && (
            <div className='p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent-foreground text-sm flex items-center gap-2'>
              <div className='h-1 w-1 rounded-full bg-accent-foreground' />
              {success}
            </div>
          )}

          <Button
            type='submit'
            className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='size-4 animate-spin' /> Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <p className='text-center text-sm text-muted-foreground font-body'>
          Remember your password?{' '}
          <Link
            to='/auth/login'
            className='font-bold text-foreground hover:underline underline-offset-4'
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
