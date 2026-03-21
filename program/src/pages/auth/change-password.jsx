'use client';

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FloatingPaths from '@/components/shared/FloatingPaths';
import { LockIcon, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

import ElegantShape from '../landing/ElegantShape';
import { cn } from '@/lib/utils';

export function ChangePasswordPage() {
  const tempPassword = sessionStorage.getItem('temp_password') || '';
  const [currentPassword, setCurrentPassword] = useState(tempPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { user: clerkUser } = useClerkAuth();

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

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Password change is handled by Clerk
      // For now, show a message
      toast.success('Password management is handled by Clerk. Use your account settings to change password.');

      localStorage.removeItem('requiresPasswordChange');
      sessionStorage.removeItem('temp_password');

      const role = localStorage.getItem('userRole') || 'manager';
      if (role === 'admin') navigate('/admin/overview');
      else if (role === 'manager') navigate('/manager/overview');
      else if (role === 'pharmacist') navigate('/pharmacist/overview');
      else if (role === 'cashier') navigate('/cashier/overview');
      else navigate('/manager/overview');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 12) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 16) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden theme-gradient">
      <div className="theme-overlay" />

      {/* Shapes */}
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
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/10">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Link to="/" className="flex items-center gap-3 mb-4 group transition-transform hover:scale-105">
                <img src="/logo.png" alt="PharmaCare Logo" className="h-10 w-10 rounded-xl shadow-lg shadow-blue-500/20" />
                <span className="font-bold text-xl text-gray-900 tracking-tight">PharmaCare</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Change Password</h1>
              <p className="text-gray-500 font-light text-sm">Update your password for better security</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold text-gray-700 ml-1">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      placeholder="Enter current password"
                      className="h-12 ps-11 pe-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                      <LockIcon className="size-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold text-gray-700 ml-1">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      placeholder="Enter new password"
                      className="h-12 ps-11 pe-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                      <LockIcon className="size-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="px-1 pt-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                        <span className="text-gray-400">Strength:</span>
                        <span className={cn(
                          passwordStrength.strength >= 75 ? "text-green-600" : 
                          passwordStrength.strength >= 50 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-500", passwordStrength.color)}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700 ml-1">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      className="h-12 ps-11 pe-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
                      <LockIcon className="size-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 ml-1 pt-1 animate-in fade-in slide-in-from-top-1">
                      <CheckCircle2 className="size-3" />
                      Passwords match
                    </p>
                  )}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Change Password'}
              </Button>
            </form>

            <div className="pt-4 border-t border-blue-50 text-center">
              <Link to={getHomePath()} className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
                Cancel and return to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </main>
  );
}
