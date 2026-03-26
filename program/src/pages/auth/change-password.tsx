'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LockIcon, Eye, EyeOff, CheckCircle2, ChevronLeftIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/components/shared/AuthLayout';

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
  const { user, isAuthenticated } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Password change is handled by Clerk
      // For now, show a message
      toast.success(
        'Password management is handled by Clerk. Use your account settings to change password.'
      );

      localStorage.removeItem('requiresPasswordChange');
      sessionStorage.removeItem('temp_password');

      const role = localStorage.getItem('userRole') || 'manager';
      let homePath = '/manager/overview';
      if (role === 'admin') homePath = '/admin/overview';
      else if (role === 'manager') homePath = '/manager/overview';
      else if (role === 'pharmacist') homePath = '/pharmacist/overview';
      else if (role === 'cashier') homePath = '/cashier/overview';
      window.location.href = homePath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 25, label: 'Weak', color: 'bg-destructive' };
    if (password.length < 12) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 16) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <Button
          variant='ghost'
          className='absolute -top-12 left-0 sm:-top-16 sm:-left-4 lg:hidden'
          asChild
        >
          <Link
            to={getHomePath()}
            className='text-muted-foreground hover:text-foreground font-semibold font-body text-sm'
          >
            <ChevronLeftIcon className='size-4 me-2' />
            Back to Dashboard
          </Link>
        </Button>

        <div className='flex flex-col space-y-2 text-left mt-8'>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground'>
            Change Password
          </h1>
          <p className='text-muted-foreground font-body text-sm font-medium'>
            Update your password for better security.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1.5'>
            <Label className='text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest'>
              Current Password
            </Label>
            <div className='relative'>
              <Input
                placeholder='Enter current password'
                className='h-12 ps-11 pr-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm'
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <LockIcon className='size-4' />
              </div>
              <button
                type='button'
                onClick={() => setShowCurrent(!showCurrent)}
                className='absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none'
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
              </button>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest'>
              New Password
            </Label>
            <div className='relative'>
              <Input
                placeholder='Enter new password'
                className='h-12 ps-11 pr-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm'
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <LockIcon className='size-4' />
              </div>
              <button
                type='button'
                onClick={() => setShowNew(!showNew)}
                className='absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none'
                tabIndex={-1}
              >
                {showNew ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
              </button>
            </div>
            {newPassword && (
              <div className='px-1 pt-1 space-y-1.5'>
                <div className='flex items-center justify-between text-[10px] uppercase tracking-wider font-bold'>
                  <span className='text-muted-foreground'>Strength:</span>
                  <span
                    className={cn(
                      passwordStrength.strength >= 75
                        ? 'text-green-600'
                        : passwordStrength.strength >= 50
                          ? 'text-yellow-600'
                          : 'text-destructive'
                    )}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className='h-1 w-full bg-muted rounded-full overflow-hidden'>
                  <div
                    className={cn('h-full transition-all duration-500', passwordStrength.color)}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label className='text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest'>
              Confirm New Password
            </Label>
            <div className='relative'>
              <Input
                placeholder='Confirm new password'
                className='h-12 ps-11 pr-11 bg-card border-input focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm text-sm'
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-muted-foreground'>
                <LockIcon className='size-4' />
              </div>
              <button
                type='button'
                onClick={() => setShowConfirm(!showConfirm)}
                className='absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none'
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
              </button>
            </div>
            {confirmPassword && newPassword === confirmPassword && (
              <p className='text-[10px] text-green-600 font-bold flex items-center gap-1 ml-1 pt-1 animate-in fade-in slide-in-from-top-1'>
                <CheckCircle2 className='size-3' />
                Passwords match
              </p>
            )}
          </div>

          {error && (
            <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2'>
              <div className='h-1 w-1 rounded-full bg-destructive' />
              {error}
            </div>
          )}

          <Button
            type='submit'
            className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='size-4 animate-spin' /> Updating...
              </span>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>

        <div className='pt-4 border-t border-input text-center'>
          <Link
            to={getHomePath()}
            className='text-xs text-muted-foreground hover:text-foreground transition-colors'
          >
            Cancel and return to dashboard
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
