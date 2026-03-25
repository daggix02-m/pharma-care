/**
 * Flag Account Dialog - Admin v4.0
 *
 * Allows admins to flag manager/staff accounts for owner review.
 * The account remains active but is marked with a visible flag.
 * Owner is notified immediately with the admin's mandatory reason.
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
import { AlertCircle, Loader2, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface FlagAccountDialogProps {
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

export function FlagAccountDialog({
  isOpen,
  onClose,
  targetUser,
  targetType,
}: FlagAccountDialogProps) {
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const flagManagerMutation = useMutation(api.admin.mutations.flagManager);
  const flagStaffMutation = useMutation(api.admin.mutations.flagStaff);

  const validateReason = (value: string): boolean => {
    if (!value.trim()) {
      setError('Reason is required');
      return false;
    }
    if (value.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return false;
    }
    if (value.trim().length > 500) {
      setError('Reason must be less than 500 characters');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!targetUser || !validateReason(reason)) return;

    setIsSubmitting(true);

    try {
      if (targetType === 'manager') {
        await flagManagerMutation({
          managerId: targetUser._id,
          flagReason: reason.trim(),
        });
      } else {
        await flagStaffMutation({
          staffId: targetUser._id,
          flagReason: reason.trim(),
        });
      }

      toast.success('Account flagged successfully', {
        description: `The ${targetType} has been flagged and the owner has been notified.`,
      });

      // Reset and close
      setReason('');
      setError(null);
      onClose();
    } catch (err) {
      console.error('Flag error:', err);
      toast.error('Failed to flag account', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  if (!targetUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-amber-700'>
            <AlertCircle className='h-5 w-5 text-amber-600' />
            Flag Account for Review
          </DialogTitle>
          <DialogDescription>
            This will place a visible &quot;Flagged&quot; badge on the account and notify the owner
            immediately. The account will remain active.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Target Account Info */}
          <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center'>
                <User className='h-5 w-5 text-amber-600' />
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
              <Label htmlFor='flag-reason' className='text-sm font-medium'>
                Reason for Flagging <span className='text-destructive'>*</span>
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
              id='flag-reason'
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) validateReason(e.target.value);
              }}
              placeholder='Explain why this account should be flagged. Be specific about your concerns. This will be shared with the pharmacy owner.'
              className={cn(
                'min-h-[100px] resize-none',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              disabled={isSubmitting}
            />
            {error && (
              <p className='text-xs text-destructive flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                {error}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className='bg-blue-50/50 border border-blue-200 rounded-lg p-3 space-y-2'>
            <p className='text-xs font-medium text-blue-900'>What happens next?</p>
            <ul className='text-xs text-blue-800 space-y-1 list-disc list-inside'>
              <li>The owner receives an immediate notification</li>
              <li>A &quot;Flagged&quot; badge appears on the account</li>
              <li>The user remains active and can still log in</li>
              <li>This action is permanently logged in the audit trail</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            variant='default'
            className='bg-amber-600 hover:bg-amber-700 text-white'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Flagging...
              </>
            ) : (
              <>
                <AlertCircle className='mr-2 h-4 w-4' />
                Flag Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FlagAccountDialog;
