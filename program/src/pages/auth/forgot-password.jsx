'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingPaths from '@/components/shared/FloatingPaths';
import { ChevronLeftIcon, AtSignIcon, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { forgotPassword } from '@/api/auth.api';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import ElegantShape from '../landing/ElegantShape';
import { cn } from '@/lib/utils';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
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
    setSuccess('');
    setVerificationCode(null);
    setIsDevelopmentMode(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(email);

      if (
        response.message &&
        (response.message.includes('503') ||
          response.message.toLowerCase().includes('service unavailable') ||
          response.message.toLowerCase().includes('email service') ||
          response.message.toLowerCase().includes('smtp'))
      ) {
        setError(
          'Email service is not configured. Please contact your administrator to reset your password.'
        );
        setIsLoading(false);
        return;
      }

      if (response.verificationCode || response.code || response.verification_code) {
        const code = response.verificationCode || response.code || response.verification_code;
        setVerificationCode(code);
        setIsDevelopmentMode(true);
        setSuccess(`Password reset code generated (Development Mode)`);
        setEmail('');
      } else if (response.success) {
        setSuccess('Password reset link has been sent to your email address.');
        setEmail('');
      } else {
        setError(response.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      if (
        err.message &&
        (err.message.includes('503') ||
          err.message.toLowerCase().includes('service unavailable') ||
          err.message.toLowerCase().includes('email service'))
      ) {
        setError(
          'Email service is not configured. Please contact your administrator to reset your password.'
        );
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
            <Button variant="ghost" className="hover:bg-blue-50 text-blue-600" asChild>
              <Link to="/auth/login">
                <ChevronLeftIcon className="size-4 me-2" />
                Back to Login
              </Link>
            </Button>

            <div className="flex flex-col items-center text-center space-y-2">
              <Link to="/" className="flex items-center gap-3 mb-4 group transition-transform hover:scale-105">
                <img src="/logo.png" alt="PharmaCare Logo" className="h-10 w-10 rounded-xl shadow-lg shadow-blue-500/20" />
                <span className="font-bold text-xl text-gray-900 tracking-tight">PharmaCare</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot Password?</h1>
              <p className="text-gray-500 font-light">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="your.email@example.com"
                    className={cn(
                      "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                      error ? "border-red-500" : ""
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

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2">
                  <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm flex items-start gap-2">
                  <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {isDevelopmentMode && verificationCode && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <span className="font-semibold text-sm">Development Mode</span>
                  </div>
                  <p className="text-xs text-blue-600">Use this code to reset your password:</p>
                  <code className="block p-3 bg-white border border-blue-200 rounded-lg text-blue-900 font-mono text-center text-lg font-bold tracking-wider">
                    {verificationCode}
                  </code>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                <strong>Having trouble?</strong> If you don&apos;t receive the email within a few
                minutes, please check your spam folder or contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </main>
  );
}
