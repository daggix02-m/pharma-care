'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClockIcon, CheckCircleIcon, Loader2Icon, WifiOffIcon } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/components/shared/AuthLayout';

const POLL_INTERVAL = 10000; // 10 seconds

export function PendingApprovalPage() {
  const navigate = useNavigate();
  const pharmacyName = localStorage.getItem('pendingPharmacyName') || 'Your Pharmacy';
  const pendingEmail = localStorage.getItem('pendingEmail') || '';
  const pendingRequestType = localStorage.getItem('pendingRequestType') || 'branch_manager';

  const [polling, setPolling] = useState(!!pendingEmail);
  const [approved, setApproved] = useState(false);
  const [pollError, setPollError] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // Use Convex to check account status
  const accountStatus = useQuery(
    api.auth.queries.checkAccountStatus,
    pendingEmail ? { email: pendingEmail } : 'skip'
  );

  const pollStatus = useCallback(async () => {
    if (!pendingEmail || !mountedRef.current) return;

    try {
      if (accountStatus?.status === 'active') {
        setApproved(true);
        setPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        toast.success('Your account has been approved! Redirecting to login...');
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingPharmacyName');
        localStorage.removeItem('pendingRequestType');
        setTimeout(() => {
          if (mountedRef.current) {
            navigate('/auth/login');
          }
        }, 2500);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      setPollError(true);
      console.error('Account status check failed:', error);
    }
  }, [pendingEmail, navigate, accountStatus]);

  useEffect(() => {
    mountedRef.current = true;
    if (pendingEmail) {
      pollStatus();
      intervalRef.current = setInterval(pollStatus, POLL_INTERVAL);
    }
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pollStatus]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (pendingEmail && !approved) {
        pollStatus();
        intervalRef.current = setInterval(pollStatus, POLL_INTERVAL);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pendingEmail, approved, pollStatus]);

  const getContextMessage = () => {
    switch (pendingRequestType) {
      case 'head_manager':
        return 'Your registration is being reviewed by the system administrator.';
      case 'create_branch':
        return 'Your branch creation request is being reviewed by the head manager.';
      case 'join_branch':
        return 'Your request to join this branch is being reviewed by the head manager.';
      default:
        return 'Your registration is being reviewed by our admin team.';
    }
  };

  const getReviewerLabel = () => {
    switch (pendingRequestType) {
      case 'head_manager':
        return 'Administrator';
      case 'create_branch':
      case 'join_branch':
        return 'Head Manager';
      default:
        return 'Admin Team';
    }
  };

  return (
    <AuthLayout>
      <div className='space-y-6 text-center'>
        <div className='flex justify-center mb-6'>
          <div
            className={cn(
              'relative p-6 rounded-full',
              approved ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'
            )}
          >
            {approved ? (
              <CheckCircleIcon className='size-16' />
            ) : (
              <>
                <ClockIcon className='size-16' />
                {polling && !pollError && (
                  <div className='absolute bottom-1 right-1 bg-card rounded-full p-1.5 shadow-sm border border-input'>
                    <Loader2Icon className='size-5 animate-spin text-primary' />
                  </div>
                )}
                {pollError && (
                  <div className='absolute bottom-1 right-1 bg-card rounded-full p-1.5 shadow-sm border border-input'>
                    <WifiOffIcon className='size-5 text-destructive' />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className='space-y-4 mb-10'>
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>
            {approved ? 'Account Approved!' : 'Awaiting Approval'}
          </h1>
          <div className='space-y-1'>
            <p className='text-primary font-semibold text-lg'>{pharmacyName}</p>
            <p className='text-muted-foreground font-medium max-w-md mx-auto line-clamp-2'>
              {getContextMessage()}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8'>
          {[
            {
              title: 'Information Received',
              desc: 'Pharmacy details captured',
              status: 'complete',
            },
            { title: 'Identity Verified', desc: 'Email address confirmed', status: 'complete' },
            {
              title: `${getReviewerLabel()} Review`,
              desc: approved ? 'Application reviewed & approved' : 'Currently being processed',
              status: approved ? 'complete' : 'pending',
            },
            {
              title: 'Access Granted',
              desc: approved ? 'Dashboard ready' : 'Waiting for approval',
              status: approved ? 'complete' : 'upcoming',
            },
          ].map((step, i) => (
            <div
              key={i}
              className={cn(
                'p-4 rounded-2xl border transition-all duration-300',
                step.status === 'complete'
                  ? 'bg-accent/10 border-accent/20'
                  : step.status === 'pending'
                    ? 'bg-primary/5 border-primary/20 animate-pulse'
                    : 'bg-muted/50 border-input opacity-60'
              )}
            >
              <div className='flex items-start gap-3'>
                <div
                  className={cn(
                    'mt-1 rounded-full p-0.5',
                    step.status === 'complete'
                      ? 'text-accent-foreground'
                      : step.status === 'pending'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.status === 'complete' ? (
                    <CheckCircleIcon className='size-5' />
                  ) : (
                    <ClockIcon className='size-5' />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className='text-[11px] text-muted-foreground leading-tight'>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='space-y-4'>
          {!approved ? (
            <div className='space-y-3'>
              <p className='text-xs text-muted-foreground'>
                {polling && !pollError ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='relative flex h-2 w-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
                    </span>
                    Checking status automatically every 10s...
                  </span>
                ) : (
                  'Automatic updates paused'
                )}
              </p>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  className='flex-1 h-12 rounded-xl text-primary border-input hover:bg-muted'
                  asChild
                >
                  <Link to='/auth/login'>Back to Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
              asChild
            >
              <Link to='/auth/login'>Go to Login</Link>
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
