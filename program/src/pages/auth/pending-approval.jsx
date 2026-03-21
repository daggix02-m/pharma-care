'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FloatingPaths from '@/components/shared/FloatingPaths';
import { ClockIcon, CheckCircleIcon, Loader2Icon, WifiOffIcon } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

import ElegantShape from '../landing/ElegantShape';
import { cn } from '@/lib/utils';

const POLL_INTERVAL = 10000; // 10 seconds

export function PendingApprovalPage() {
  const navigate = useNavigate();
  const pharmacyName = localStorage.getItem('pendingPharmacyName') || 'Your Pharmacy';
  const pendingEmail = localStorage.getItem('pendingEmail') || '';
  const pendingRequestType = localStorage.getItem('pendingRequestType') || 'branch_manager';

  const [polling, setPolling] = useState(!!pendingEmail);
  const [approved, setApproved] = useState(false);
  const [pollError, setPollError] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Use Convex to check account status
  const accountStatus = useQuery(api.auth.queries.checkAccountStatus, pendingEmail ? { email: pendingEmail } : "skip");

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

      <div className="relative z-10 w-full max-w-2xl px-6 py-12">
        <div className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 text-center">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105">
              <img src="/logo.png" alt="PharmaCare Logo" className="h-12 w-12 rounded-xl shadow-lg shadow-blue-500/20" />
              <span className="font-bold text-2xl text-gray-900 tracking-tight">PharmaCare</span>
            </Link>
          </div>

          <div className="flex justify-center mb-6">
            <div className={cn(
              "relative p-6 rounded-full",
              approved ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
            )}>
              {approved ? (
                <CheckCircleIcon className="size-16" />
              ) : (
                <>
                  <ClockIcon className="size-16" />
                  {polling && !pollError && (
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-sm border border-blue-100">
                      <Loader2Icon className="size-5 animate-spin text-blue-600" />
                    </div>
                  )}
                  {pollError && (
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-sm border border-orange-100">
                      <WifiOffIcon className="size-5 text-orange-500" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {approved ? 'Account Approved!' : 'Awaiting Approval'}
            </h1>
            <div className="space-y-1">
              <p className="text-blue-600 font-semibold text-lg">{pharmacyName}</p>
              <p className="text-gray-500 font-light max-w-md mx-auto line-clamp-2">
                {getContextMessage()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            {[
              { title: 'Information Received', desc: 'Pharmacy details captured', status: 'complete' },
              { title: 'Identity Verified', desc: 'Email address confirmed', status: 'complete' },
              { title: `${getReviewerLabel()} Review`, desc: approved ? 'Application reviewed & approved' : 'Currently being processed', status: approved ? 'complete' : 'pending' },
              { title: 'Access Granted', desc: approved ? 'Dashboard ready' : 'Waiting for approval', status: approved ? 'complete' : 'upcoming' }
            ].map((step, i) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl border transition-all duration-300",
                step.status === 'complete' ? "bg-green-50/30 border-green-100" : 
                step.status === 'pending' ? "bg-blue-50/30 border-blue-200 animate-pulse" : 
                "bg-gray-50/50 border-gray-100 opacity-60"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 rounded-full p-0.5",
                    step.status === 'complete' ? "text-green-600" : 
                    step.status === 'pending' ? "text-blue-600" : "text-gray-400"
                  )}>
                    {step.status === 'complete' ? <CheckCircleIcon className="size-5" /> : <ClockIcon className="size-5" />}
                  </div>
                  <div>
                    <p className={cn(
                      "font-semibold text-sm",
                      step.status === 'upcoming' ? "text-gray-500" : "text-gray-900"
                    )}>{step.title}</p>
                    <p className="text-[11px] text-gray-500 leading-tight">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {!approved ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  {polling && !pollError ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      Checking status automatically every 10s...
                    </span>
                  ) : "Automatic updates paused"}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl text-blue-600 border-blue-100 hover:bg-blue-50" asChild>
                    <Link to="/auth/login">Back to Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all" asChild>
                <Link to="/auth/login">Go to Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </main>
  );
}
