'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth as useAppAuth } from '@/contexts/AuthContext';
import { useSignIn } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingPaths from '@/components/shared/FloatingPaths';
import { AtSignIcon, LockIcon, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';

import logger from '@/utils/logger';
import ElegantShape from '../landing/ElegantShape';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [firstFactorResponse, setFirstFactorResponse] = useState(null);
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated, user } = useAppAuth();

  const { isLoaded, signIn, setActive } = useSignIn();
  const storeUser = useMutation(api.users.mutations.storeUser || (() => {})); // Sync Auth to Database

  const containerRef = useRef(null);
  const formRef = useRef(null);

  const getHomePath = () => {
    if (isAuthenticated && user) {
      const role = user.role;
      if (role === 'admin') return '/admin/overview';
      if (role === 'manager') return '/manager/overview';
      if (role === 'pharmacist') return '/pharmacist/overview';
      if (role === 'cashier') return '/cashier/overview';
      return '/manager/overview';
    }
    return '/';
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (formRef.current) {
        tl.fromTo(
          formRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');

    // If 2FA is required, handle it
    if (requiresTwoFactor) {
      if (!twoFactorCode) {
        setError('Please enter your 2FA code.');
        return;
      }

      setIsLoading(true);
      try {
        const signInAttempt = await signIn.attemptSecondFactor({
          strategy: 'email_code',
          code: twoFactorCode,
        });

        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });

          const userData = await storeUser();
          let userRole = userData?.role || 'user';

          if (userData?.status === 'pending') {
            navigate('/auth/pending-approval');
            return;
          }

          authLogin({
            id: userData?._id,
            email: userData?.email || email,
            full_name: userData?.full_name || '',
            role: userRole,
            pharmacy_name: userData?.pharmacy?.name,
          });

          if (userRole === 'admin') navigate('/admin/overview');
          else if (userRole === 'manager') navigate('/manager/overview');
          else if (userRole === 'pharmacist') navigate('/pharmacist/overview');
          else if (userRole === 'cashier') navigate('/cashier/overview');
          else navigate('/manager/overview');
        } else {
          setError('Invalid 2FA code. Please try again.');
        }
      } catch (err) {
        setError(err.errors?.[0]?.longMessage || '2FA verification failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular login flow (first factor)
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });

        const userData = await storeUser();
        let userRole = userData?.role || 'user';

        if (userData?.status === 'pending') {
          navigate('/auth/pending-approval');
          return;
        }

        authLogin({
          id: userData?._id,
          email: userData?.email || email,
          full_name: userData?.full_name || '',
          role: userRole,
          pharmacy_name: userData?.pharmacy?.name,
        });

        if (userRole === 'admin') navigate('/admin/overview');
        else if (userRole === 'manager') navigate('/manager/overview');
        else if (userRole === 'pharmacist') navigate('/pharmacist/overview');
        else if (userRole === 'cashier') navigate('/cashier/overview');
        else navigate('/manager/overview');

      } else if (signInAttempt.status === 'needs_second_factor') {
        // Show 2FA input form
        setRequiresTwoFactor(true);
        setFirstFactorResponse(signInAttempt);
      } else {
        setError('Additional authentication steps required.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center overflow-hidden theme-gradient">
      <div className="theme-overlay" />

      {/* Shapes - matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-blue-500/[0.12]"
          className="left-[-10%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-cyan-500/[0.12]"
          className="right-[-5%] top-[70%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-indigo-500/[0.12]"
          className="left-[5%] bottom-[5%]"
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/10">
          <div ref={formRef} className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Link to="/" className="flex items-center gap-3 mb-4 group transition-transform hover:scale-105">
                <img src="/logo.png" alt="PharmaCare Logo" className="h-12 w-12 rounded-xl shadow-lg shadow-blue-500/20" />
                <span className="font-bold text-2xl text-gray-900 tracking-tight">PharmaCare</span>
              </Link>
              {requiresTwoFactor ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Two-Factor Authentication</h1>
                  <p className="text-gray-500 font-light">Enter the 6-digit code sent to your email</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                  <p className="text-gray-500 font-light">Enter your credentials to access your portal</p>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {requiresTwoFactor ? (
                // 2FA Code Input
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Enter 6-digit code"
                        className="h-12 text-center text-2xl tracking-widest bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl"
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-red-600" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    disabled={isLoading || twoFactorCode.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequiresTwoFactor(false);
                      setTwoFactorCode('');
                      setFirstFactorResponse(null);
                      setError('');
                    }}
                    className="w-full text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    ← Back to email/password login
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signIn.prepareSecondFactor({ strategy: 'email_code' });
                        toast.success('A new code has been sent to your email');
                      } catch (err) {
                        toast.error('Failed to resend code');
                      }
                    }}
                    className="w-full text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Resend verification code
                  </button>
                </div>
              ) : (
                // Email/Password Login
                <>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Email address"
                        className={cn(
                          "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                          error && (email === '') ? "border-red-500" : ""
                        )}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                        <AtSignIcon className="size-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Password"
                        className={cn(
                          "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                          error && (password === '') ? "border-red-500" : ""
                        )}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                        <LockIcon className="size-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-red-600" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </>
              )}
            </form>

            <div className="text-center space-y-4">
              <div className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link to="/auth/signup" className="text-blue-600 font-semibold hover:underline underline-offset-4">
                  Create an account
                </Link>
              </div>
              
              <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                By signing in, you agree to our{' '}
                <a href="#" className="hover:text-blue-600 underline underline-offset-4">Terms</a> and{' '}
                <a href="#" className="hover:text-blue-600 underline underline-offset-4">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </main>
  );
}
