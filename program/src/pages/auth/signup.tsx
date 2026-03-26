'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useSignupStore } from '@/store/useSignupStore';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  ChevronLeftIcon,
  MailIcon,
  LockIcon,
  BuildingIcon,
  MapPinIcon,
  UserRoundIcon,
  Eye,
  EyeOff,
  Loader2Icon,
  HashIcon,
  CheckCircle2,
} from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/components/shared/AuthLayout';
import { OAuthButtons } from '@/components/shared/OAuthButtons';
import { AuthSeparator } from '@/components/shared/AuthSeparator';

// ─── Step 1: Pharmacy Details ───────────────────────────────────────────────────
const Step1PharmacyDetails = () => {
  const { pharmacyDetails, errors, setPharmacyDetails, validateCurrentStep, goToNextStep } =
    useSignupStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    let ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current!.children,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power1.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleContinue = () => {
    if (!validateCurrentStep(1)) return;

    // Save to session storage in case user selects OAuth on the next step
    sessionStorage.setItem('pendingPharmacyDetails', JSON.stringify(pharmacyDetails));

    goToNextStep();
  };

  return (
    <div ref={containerRef} className='space-y-4'>
      <div className='bg-muted p-4 rounded-xl border border-input space-y-2'>
        <div className='flex items-start gap-3'>
          <div className='p-2 bg-card border border-input rounded-lg shadow-sm'>
            <BuildingIcon className='size-4 text-foreground' />
          </div>
          <div>
            <p className='text-sm font-bold text-foreground'>Pharmacy Registration</p>
            <p className='text-[12px] text-muted-foreground leading-relaxed mt-0.5 font-medium'>
              Register your licensed pharmacy to get started with PharmaCare.
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-4 pt-2'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5 col-span-2'>
            <Label className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1'>
              Pharmacy Name
            </Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.pharmacyName}
                onChange={(e) => setPharmacyDetails('pharmacyName', e.target.value)}
                placeholder='e.g. Addis Pharmaceutical Supply'
                className={cn(
                  'h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                  errors.pharmacyName ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <BuildingIcon className='size-4' />
              </div>
            </div>
            {errors.pharmacyName && (
              <p className='text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide'>
                {errors.pharmacyName}
              </p>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1'>
              License Number
            </Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.licenseCode}
                onChange={(e) => setPharmacyDetails('licenseCode', e.target.value)}
                placeholder='EFDA License No.'
                className={cn(
                  'h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                  errors.licenseCode ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <HashIcon className='size-4' />
              </div>
            </div>
            {errors.licenseCode && (
              <p className='text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide'>
                {errors.licenseCode}
              </p>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1'>
              Location / Branch
            </Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.locations}
                onChange={(e) => setPharmacyDetails('locations', e.target.value)}
                placeholder='e.g. Bole, Addis Ababa'
                className={cn(
                  'h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                  errors.locations ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <MapPinIcon className='size-4' />
              </div>
            </div>
            {errors.locations && (
              <p className='text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide'>
                {errors.locations}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleContinue}
          className='w-full h-12 mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// ─── Step 2: Admin Profile ───────────────────────────────────────────────────────
const Step2AdminProfile = () => {
  const {
    managerInfo,
    errors,
    setManagerInfo,
    validateCurrentStep,
    goToNextStep,
    goToPreviousStep,
    pharmacyDetails,
  } = useSignupStore();
  const signUpMutation = useMutation(api.auth.mutations.signUpWithEmail);
  const sendVerificationEmail = useMutation(api.auth.mutations.sendVerificationEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    let ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current!.children,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power1.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(2)) return;
    setIsLoading(true);

    try {
      // Call Convex signUp mutation
      await signUpMutation({
        email: managerInfo.email,
        password: managerInfo.password,
        full_name: managerInfo.fullName,
        pharmacyDetails: {
          name: pharmacyDetails.pharmacyName,
          licenseNumber: pharmacyDetails.licenseCode,
          location: pharmacyDetails.locations,
        },
      });

      // Store email and password in sessionStorage for verification step
      sessionStorage.setItem('pendingVerificationEmail', managerInfo.email);
      sessionStorage.setItem('tempPassword', managerInfo.password);

      // Send verification email
      await sendVerificationEmail({ email: managerInfo.email });

      toast.success('Verification code sent to your email.');
      goToNextStep();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className='space-y-4'>
      <div className='flex items-center gap-3 mb-6'>
        <Button
          variant='ghost'
          size='icon'
          onClick={goToPreviousStep}
          className='h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground'
        >
          <ChevronLeftIcon className='size-4' />
        </Button>
        <div>
          <p className='text-sm font-bold text-foreground'>Administrator Account</p>
          <p className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5'>
            Step 2 of 3
          </p>
        </div>
      </div>

      <OAuthButtons mode='signup' />
      <AuthSeparator />

      <form onSubmit={handleRegister} className='space-y-4 pt-2'>
        <div className='space-y-1.5'>
          <Label className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1'>
            Full Name
          </Label>
          <div className='relative'>
            <Input
              value={managerInfo.fullName}
              onChange={(e) => setManagerInfo('fullName', e.target.value)}
              placeholder='Enter your full name'
              className={cn(
                'h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                errors.fullName ? 'border-red-500' : ''
              )}
            />
            <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
              <UserRoundIcon className='size-4' />
            </div>
          </div>
          {errors.fullName && (
            <p className='text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide'>
              {errors.fullName}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1'>
            Email Address
          </Label>
          <div className='relative'>
            <Input
              type='email'
              value={managerInfo.email}
              onChange={(e) => setManagerInfo('email', e.target.value)}
              placeholder='your.email@company.com'
              className={cn(
                'h-12 ps-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                errors.email ? 'border-red-500' : ''
              )}
            />
            <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
              <MailIcon className='size-4' />
            </div>
          </div>
          {errors.email && (
            <p className='text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide'>
              {errors.email}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1'>
            Password
          </Label>
          <div className='relative'>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={managerInfo.password}
              onChange={(e) => setManagerInfo('password', e.target.value)}
              placeholder='Minimum 8 characters'
              className={cn(
                'h-12 ps-11 pr-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm',
                errors.password ? 'border-red-500' : ''
              )}
            />
            <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
              <LockIcon className='size-4' />
            </div>
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors'
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
            </button>
          </div>
          {errors.password && (
            <p className='text-red-500 text-[10px] font-bold ml-1 uppercase tracking-wide'>
              {errors.password}
            </p>
          )}
        </div>

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full h-12 mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <Loader2Icon className='size-4 animate-spin' /> Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </div>
  );
};

// ─── Step 3: Verification ───────────────────────────────────────────────────────
const Step3Verification = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Convex auth mutations
  const verifyMutation = useMutation(api.auth.mutations.verifyEmail);
  const signInMutation = useMutation(api.auth.mutations.signInWithEmail);
  const sendVerificationEmail = useMutation(api.auth.mutations.sendVerificationEmail);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    let ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current!.children,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power1.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setIsLoading(true);

    try {
      // Get email from sessionStorage
      const email = sessionStorage.getItem('pendingVerificationEmail');
      const tempPassword = sessionStorage.getItem('tempPassword');

      if (!email || !tempPassword) {
        throw new Error('Session expired. Please start registration again.');
      }

      // Verify email with Convex
      await verifyMutation({ email, token: code });

      toast.success('Email verified successfully!');

      // Auto-login after verification
      const result = await signInMutation({ email, password: tempPassword });

      // Store session token
      if (result.sessionToken) {
        localStorage.setItem('sessionToken', result.sessionToken);
      }

      // Clean up sessionStorage
      sessionStorage.removeItem('pendingVerificationEmail');
      sessionStorage.removeItem('tempPassword');

      toast.success('Welcome! Redirecting to your dashboard...');
      // Use window.location for full page reload to ensure auth state is fresh
      window.location.href = '/admin';
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      // Get email from sessionStorage
      const email = sessionStorage.getItem('pendingVerificationEmail');
      if (!email) {
        throw new Error('Session expired. Please start registration again.');
      }

      await sendVerificationEmail({ email });
      toast.success(`A new verification code was sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setTimeout(() => setIsResending(false), 3000);
    }
  };

  return (
    <div ref={containerRef} className='space-y-6 text-center pt-4'>
      <div className='mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 shadow-sm border border-accent'>
        <MailIcon className='size-8 text-accent-foreground' />
      </div>

      <div className='space-y-2'>
        <h3 className='text-2xl font-bold font-display text-foreground'>Verify Your Email</h3>
        <p className='text-sm text-muted-foreground font-body'>
          Enter the 6-digit verification code sent to
          <br />
          <span className='font-bold text-foreground'>
            {sessionStorage.getItem('pendingVerificationEmail') || ''}
          </span>
        </p>
      </div>

      <form onSubmit={handleVerify} className='space-y-6 mt-8'>
        <div className='space-y-3'>
          <Label className='sr-only'>Verification Code</Label>
          <Input
            type='text'
            placeholder='000000'
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className='h-16 text-center text-3xl tracking-[0.5em] font-bold bg-muted border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm'
            required
            autoFocus
          />
        </div>

        <Button
          type='submit'
          disabled={isLoading || code.length !== 6}
          className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <Loader2Icon className='size-4 animate-spin' /> Verifying...
            </span>
          ) : (
            'Complete Registration'
          )}
        </Button>
      </form>

      <div className='pt-6 border-t border-border'>
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest'>
          Didn't receive the code?
        </p>
        <Button
          variant='ghost'
          onClick={handleResendCode}
          disabled={isResending}
          className='mt-2 text-sm font-semibold text-foreground hover:text-foreground hover:bg-muted rounded-lg'
        >
          {isResending ? 'Sending...' : 'Resend Code'}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Page Component ────────────────────────────────────────────────────────
export function SignupPage() {
  const { currentStep, resetSignup } = useSignupStore();

  useEffect(() => {
    resetSignup();
  }, [resetSignup]);

  return (
    <AuthLayout>
      <div className='absolute top-8 left-6 sm:top-12 sm:left-12 z-20 hidden lg:block'>
        <Button
          variant='ghost'
          asChild
          className='hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground font-semibold font-body text-sm h-10 px-4'
        >
          <Link to='/'>
            <ChevronLeftIcon className='size-4 me-2' />
            Home
          </Link>
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className='mb-10 w-full max-w-sm xl:max-w-md mx-auto pt-8 lg:pt-0'>
        <div className='flex justify-between mb-2'>
          {['Pharmacy', 'Admin', 'Verify'].map((label, i) => {
            const stepNumber = i + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={label} className='flex flex-col items-center gap-2'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display shadow-sm transition-all duration-300',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'bg-muted text-foreground border border-input'
                        : 'bg-card text-muted-foreground border border-input'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className='w-4 h-4' /> : stepNumber}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className='relative h-1.5 w-full bg-muted rounded-full overflow-hidden'>
          <div
            className='absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out'
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      <div className='w-full max-w-sm xl:max-w-md mx-auto'>
        <div className='flex flex-col space-y-2 text-left mb-6'>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground'>
            Create Your Account
          </h1>
          <p className='text-muted-foreground font-body text-sm font-medium'>
            Set up your pharmacy profile and start managing your business efficiently.
          </p>
        </div>

        {currentStep === 1 && <Step1PharmacyDetails />}
        {currentStep === 2 && <Step2AdminProfile />}
        {currentStep === 3 && <Step3Verification />}

        {currentStep < 3 && (
          <p className='text-center text-sm text-muted-foreground font-body mt-8'>
            Already have an account?{' '}
            <Link
              to='/auth/login'
              className='font-bold text-foreground hover:underline underline-offset-4'
            >
              Sign In
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
