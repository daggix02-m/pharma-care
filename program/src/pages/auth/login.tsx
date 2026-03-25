'use client';

import { useState } from 'react';
import { useAuth as useAppAuth } from '@/contexts/AuthContext';
import { useSignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AtSignIcon,
  LockIcon,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeftIcon,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/shared/AuthLayout';
import { OAuthButtons } from '@/components/shared/OAuthButtons';
import { AuthSeparator } from '@/components/shared/AuthSeparator';
import { usePageTransition } from '@/hooks/useGsapAnimation';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [requiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  const formRef = usePageTransition();
  const { signOut } = useAuth();

  const getHomePath = () => {
    if (isAuthenticated && user) {
      const role = user.role;
      if (role === 'admin') return '/admin';
      if (role === 'manager') return '/manager';
      if (role === 'pharmacist') return '/pharmacist';
      if (role === 'cashier') return '/cashier/overview';
      return '/manager';
    }
    return '/';
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (requiresTwoFactor) {
      if (!twoFactorCode) {
        toast.error('Please enter your 2FA code.');
        return;
      }
      setIsLoading(true);
      try {
        const signInAttempt = await signIn.attemptSecondFactor({
          strategy: 'email_code',
          code: twoFactorCode,
        });

        if (signInAttempt.status === 'complete') {
          setIsFinalizing(true);
          await setActive({ session: signInAttempt.createdSessionId });
          toast.success('Successfully logged in');
          setTimeout(() => {
            setIsFinalizing(false);
            navigate('/auth/login');
          }, 500);
        } else {
          toast.error('Unable to complete 2FA. Please try again.');
        }
      } catch (err: any) {
        toast.error(err.errors?.[0]?.message || 'Invalid 2FA code.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        setIsFinalizing(true);
        await setActive({ session: signInAttempt.createdSessionId });
        toast.success('Successfully logged in');
        setTimeout(() => {
          setIsFinalizing(false);
        }, 500);
      } else {
        toast.error('Unable to complete sign in. Please try again.');
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === 'session_exists') {
        toast.info('You are already signed in.');
        navigate('/auth/login');
      } else {
        toast.error(err.errors?.[0]?.message || 'Sign in failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div
        ref={formRef}
        className='space-y-6 animate-fade-in relative z-10 w-full h-full flex flex-col justify-center'
      >
        {isFinalizing && (
          <div className='absolute inset-0 z-50 bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 rounded-3xl'>
            <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center'>
              <CheckCircle2 className='text-primary-foreground size-10' />
            </div>
            <div className='text-center'>
              <h3 className='text-xl font-bold text-foreground'>Sign In Successful</h3>
              <p className='text-sm text-muted-foreground font-medium'>Preparing your dashboard...</p>
            </div>
          </div>
        )}
        <Button
          variant='ghost'
          className='absolute -top-12 left-0 sm:-top-16 sm:-left-4 lg:hidden'
          asChild
        >
          <Link
            to='/'
            className='text-muted-foreground hover:text-foreground font-semibold font-body text-sm'
          >
            <ChevronLeftIcon className='size-4 me-2' />
            Home
          </Link>
        </Button>
        <div className='flex flex-col space-y-2 text-left mt-8'>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground'>
            {isAuthenticated ? 'Welcome Back' : 'Sign In to Your Account'}
          </h1>
          <p className='text-muted-foreground font-body text-sm font-medium'>
            {isAuthenticated
              ? 'You are already signed in to your account.'
              : 'Access your pharmacy dashboard and manage your operations.'}
          </p>
        </div>

        {!isAuthenticated ? (
          <>
            {!requiresTwoFactor && (
              <div className='pt-2'>
                <OAuthButtons mode='login' />
              </div>
            )}

            {!requiresTwoFactor && <AuthSeparator />}

            <form onSubmit={handleSubmit} className='space-y-4'>
              {!requiresTwoFactor ? (
                <>
                  <div className='space-y-1.5'>
                    <Label className='text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest'>
                      Email Address
                    </Label>
                    <div className='relative'>
                      <Input
                        placeholder='Enter your email address'
                        className='h-12 ps-11 bg-card border border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                      <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                        <AtSignIcon className='size-4' aria-hidden='true' />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between ml-1'>
                      <Label className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                        Password
                      </Label>
                      <Link
                        to='/auth/forgot-password'
                        className='text-[10px] font-bold text-muted-foreground hover:text-foreground underline-offset-4 hover:underline uppercase tracking-wide'
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className='relative'>
                      <Input
                        placeholder='Enter your password'
                        className='h-12 ps-11 pr-11 bg-card border border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm'
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                      <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                        <LockIcon className='size-4' aria-hidden='true' />
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
                </>
              ) : (
                <div className='space-y-4'>
                  <div className='p-4 bg-muted rounded-xl border border-input text-center shadow-sm'>
                    <p className='text-sm text-muted-foreground font-medium'>
                      A verification code has been sent to your email for additional security.
                    </p>
                  </div>
                  <div className='space-y-1.5'>
                    <Label className='text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest'>
                      Verification Code
                    </Label>
                    <Input
                      type='text'
                      placeholder='Enter 6-digit code'
                      className='h-14 text-center tracking-[0.5em] text-xl font-bold bg-card border border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm'
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      disabled={isLoading}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type='submit'
                className='w-full h-12 mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='size-5 animate-spin' />
                ) : requiresTwoFactor ? (
                  'Verify & Continue'
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </>
        ) : (
                <div className='space-y-6 pt-4'>
            <div className='p-6 bg-muted rounded-2xl border border-input text-center space-y-4 shadow-sm'>
              <div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2'>
                <CheckCircle2 className='text-primary-foreground size-8' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-foreground font-display'>Already Signed In</h3>
                <p className='text-sm text-muted-foreground font-body mt-1'>
                  You are currently logged in as
                  <br />
                  <span className='font-bold text-foreground/90'>{user?.email}</span>
                </p>
              </div>
            </div>

            <div className='grid gap-3'>
              <Button
                onClick={() => navigate(getHomePath())}
                className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
              >
                Continue to Dashboard
              </Button>
              <Button
                variant='outline'
                onClick={handleSignOut}
                disabled={isLoading}
                className='w-full h-12 border-input text-foreground/80 hover:bg-muted rounded-xl font-bold'
              >
                {isLoading ? (
                  <Loader2 className='size-5 animate-spin' />
                ) : (
                  'Sign Out'
                )}
              </Button>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <p className='text-muted-foreground mt-8 text-sm text-center'>
            By signing in, you agree to our{' '}
            <a href='#' className='hover:text-foreground underline underline-offset-4'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href='#' className='hover:text-foreground underline underline-offset-4'>
              Privacy Policy
            </a>
            .
          </p>
        )}

        {!isAuthenticated && (
          <p className='text-center text-sm text-muted-foreground font-body mt-2'>
            Don't have an account?{' '}
            <Link
              to='/auth/signup'
              className='font-bold text-foreground hover:underline underline-offset-4'
            >
              Register Your Pharmacy
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
