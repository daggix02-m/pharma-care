'use client';

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingPaths from '@/components/shared/FloatingPaths';
import { ChevronLeftIcon, LockIcon, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/api/auth.api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

import ElegantShape from '../landing/ElegantShape';

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

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
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

    setIsLoading(true);

    try {
      const response = await resetPassword(token, password);

      if (response.success) {
        setSuccess('Password has been reset successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h1>
              <p className="text-gray-500 font-light">Enter your new security credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="New Password"
                    className={cn(
                      "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                      error && error.includes('Password') ? "border-red-500" : ""
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

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Confirm New Password"
                    className={cn(
                      "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                      error && error.includes('match') ? "border-red-500" : ""
                    )}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                    <LockIcon className="size-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-600" />
                  {success}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </main>
  );
}
