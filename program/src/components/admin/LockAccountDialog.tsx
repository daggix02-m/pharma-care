/**
 * Lock Account Dialog - Admin v4.0
 *
 * Allows admins to temporarily lock manager/staff accounts.
 * The account is immediately blocked from logging in.
 * Owner is notified immediately with the admin's mandatory reason.
 * Owner can review and lift the lock.
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, User, Building2, Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface LockAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    _id: string;
    full_name: string;
    email: string;
    role: string;
    pharmacyName?: string;
    branchName?: string;
  } | null;
  targetType: 'manager' | 'staff';
}

export function LockAccountDialog({
  isOpen,
  onClose,
  targetUser,
  targetType,
}: LockAccountDialogProps) {
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const lockManagerMutation = useMutation(api.admin.mutations.temporaryLockManager);
  const lockStaffMutation = useMutation(api.admin.mutations.temporaryLockStaff);

  const validateReason = (value: string): boolean => {
    if (!value.trim()) {
      setError('Reason is required');
      return false;
    }
    if (value.trim().length < 20) {
      setError('Please provide a detailed reason (minimum 20 characters)');
      return false;
    }
    if (value.trim().length > 500) {
      setError('Reason must be less than 500 characters');
      return false;
    }
    setError(null);
    return true;
  };

  const handleConfirm = () => {
    if (validateReason(reason)) {
      setShowConfirm(true);
    }
  };

  const handleSubmit = async () => {
    if (!targetUser) return;

    setIsSubmitting(true);

    try {
      if (targetType === 'manager') {
        await lockManagerMutation({
          managerId: targetUser._id,
          lockReason: reason.trim(),
        });
      } else {
        await lockStaffMutation({
          staffId: targetUser._id,
          lockReason: reason.trim(),
        });
      }

      toast.success('Account locked successfully', {
        description: `The ${targetType} has been locked and all active sessions terminated. The owner has been notified.`,
      });

      // Reset and close
      setReason('');
      setError(null);
      setShowConfirm(false);
      onClose();
    } catch (err) {
      console.error('Lock error:', err);
      toast.error('Failed to lock account', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    setShowConfirm(false);
    onClose();
  };

  if (!targetUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        {!showConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-red-700'>
                <Lock className='h-5 w-5 text-red-600' />
                Temporarily Lock Account
              </DialogTitle>
              <DialogDescription>
                This will immediately block the account from logging in. All active sessions will be
                terminated. The owner will be notified.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-6 py-4'>
              {/* Target Account Info */}
              <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-full bg-red-100 flex items-center justify-center'>
                    <User className='h-5 w-5 text-red-600' />
                  </div>
                  <div>
                    <p className='font-semibold text-sm'>{targetUser.full_name}</p>
                    <p className='text-xs text-muted-foreground'>{targetUser.email}</p>
                  </div>
                  <Badge variant='outline' className='ml-auto capitalize'>
                    {targetUser.role}
                  </Badge>
                </div>

                {(targetUser.pharmacyName || targetUser.branchName) && (
                  <div className='flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50'>
                    {targetUser.pharmacyName && (
                      <>
                        <Building2 className='h-3 w-3' />
                        <span>{targetUser.pharmacyName}</span>
                      </>
                    )}
                    {targetUser.branchName && (
                      <>
                        <span className='mx-1'>•</span>
                        <span>{targetUser.branchName}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Reason Input */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='lock-reason' className='text-sm font-medium'>
                    Reason for Locking <span className='text-destructive'>*</span>
                  </Label>
                  <span
                    className={cn(
                      'text-xs',
                      reason.length > 500 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {reason.length}/500
                  </span>
                </div>
                <Textarea
                  id='lock-reason'
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) validateReason(e.target.value);
                  }}
                  placeholder='Explain why this account needs to be locked. Be specific about the security concern or suspicious activity. This will be shared with the pharmacy owner and logged permanently.'
                  className={cn(
                    'min-h-[100px] resize-none',
                    error && 'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isSubmitting}
                />
                {error && (
                  <p className='text-xs text-destructive flex items-center gap-1'>
                    <AlertTriangle className='h-3 w-3' />
                    {error}
                  </p>
                )}
              </div>

              {/* Warning Box */}
              <div className='bg-red-50/50 border border-red-200 rounded-lg p-4 space-y-3'>
                <div className='flex items-start gap-2'>
                  <ShieldAlert className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm font-semibold text-red-900'>Important</p>
                    <p className='text-xs text-red-800 mt-1'>
                      This action will immediately block the user from accessing the system. Only
                      use this for urgent security concerns or suspicious activity.
                    </p>
                  </div>
                </div>
                <ul className='text-xs text-red-700 space-y-1 list-disc list-inside'>
                  <li>User cannot log in (even with correct credentials)</li>
                  <li>All active sessions are terminated immediately</li>
                  <li>Owner receives immediate notification</li>
                  <li>Owner can review and lift this lock</li>
                  <li>This action is permanently logged</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!reason.trim() || isSubmitting}
                variant='destructive'
              >
                Review Lock Details
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-red-700'>
                <ShieldAlert className='h-5 w-5 text-red-600' />
                Confirm Account Lock
              </DialogTitle>
              <DialogDescription>
                Please review the details before confirming. This action cannot be undone without
                owner review.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Account to Lock
                </p>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-full bg-red-100 flex items-center justify-center'>
                    <User className='h-5 w-5 text-red-600' />
                  </div>
                  <div>
                    <p className='font-semibold text-sm'>{targetUser.full_name}</p>
                    <p className='text-xs text-muted-foreground'>{targetUser.email}</p>
                  </div>
                  <Badge variant='outline' className='ml-auto capitalize'>
                    {targetUser.role}
                  </Badge>
                </div>
              </div>

              <div className='bg-muted/50 rounded-lg p-4 space-y-2'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Reason for Lock
                </p>
                <p className='text-sm text-foreground whitespace-pre-wrap'>{reason}</p>
              </div>

              <div className='bg-amber-50/50 border border-amber-200 rounded-lg p-3 flex items-start gap-2'>
                <AlertTriangle className='h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0' />
                <p className='text-xs text-amber-800'>
                  This will immediately terminate all active sessions and prevent login. The owner
                  will be notified and can review this action.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} variant='destructive'>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Locking...
                  </>
                ) : (
                  <>
                    <Lock className='mr-2 h-4 w-4' />
                    Confirm Lock Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LockAccountDialog;
