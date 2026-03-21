'use client';

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingPaths from '@/components/shared/FloatingPaths';
import { MailIcon, AtSignIcon, ChevronLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

import ElegantShape from '../landing/ElegantShape';
import { cn } from '@/lib/utils';

export function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Email verification is handled by Clerk
      // Users are automatically verified when they click the link in their email
      toast.success('Email verification is handled by Clerk. Please check your email for the verification link.');
      navigate('/auth/login');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address to resend verification.');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      // Email verification is handled by Clerk
      toast.success('Verification emails are handled by Clerk. Check your email for the verification link.');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden theme-gradient">
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
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Link to="/" className="flex items-center gap-3 mb-4 group transition-transform hover:scale-105">
                <img src="/logo.png" alt="PharmaCare Logo" className="h-10 w-10 rounded-xl shadow-lg shadow-blue-500/20" />
                <span className="font-bold text-xl text-gray-900 tracking-tight">PharmaCare</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verify Your Email</h1>
              <p className="text-gray-500 font-light text-sm">Enter the code sent to your email address</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="your.email@example.com"
                    className={cn(
                      "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                      error && (error.includes('Email') || error.includes('email')) ? "border-red-500" : ""
                    )}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                    <AtSignIcon className="size-4" />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    placeholder="Enter 6-digit code"
                    className={cn(
                      "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl text-lg font-mono tracking-[0.3em] text-center",
                      error && error.includes('code') ? "border-red-500" : ""
                    )}
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                    <MailIcon className="size-4" />
                  </div>
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
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            <div className="text-center space-y-4 pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                {isResending ? 'Sending...' : "Didn't receive a code? Resend"}
              </button>

              <div className="pt-4 border-t border-blue-50">
                <Link to="/auth/login" className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors inline-flex items-center gap-2">
                  <ChevronLeftIcon className="size-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </main>
  );
}