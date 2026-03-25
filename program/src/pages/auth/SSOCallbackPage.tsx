'use client';

import { useEffect, useState } from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Pill, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingPaths } from '@/components/shared/FloatingPaths';

export function SSOCallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const createPharmacy = useMutation(api.admin.mutations.createPharmacyAndBranch);
  const addBranch = useMutation(api.admin.mutations.addBranch);
  const [status, setStatus] = useState('Authenticating...');

  const getHomePath = () => {
    if (isAuthenticated && user) {
      const role = user.role;
      if (role === 'admin') return '/admin';
      if (role === 'manager') return '/manager';
      if (role === 'pharmacist') return '/pharmacist';
      if (role === 'cashier') return '/cashier/overview';
      return '/manager';
    }
    return '/';
  };

  useEffect(() => {
    const handleSSOCompletion = async () => {
      // 1. Wait for AuthContext to sync user
      if (!isAuthenticated || !user) return;

      setStatus('Processing account setup...');

      // 2. Check if there's pending pharmacy registration data from signup Step 1
      const pendingDataStr = sessionStorage.getItem('pendingPharmacyDetails');

      if (pendingDataStr) {
        try {
          const pendingData = JSON.parse(pendingDataStr);

          // Only create pharmacy if the user doesn't have one yet
          if (!user.pharmacyId) {
            setStatus('Creating your pharmacy workspace...');

            const pharmacyId = await createPharmacy({
              name: pendingData.pharmacyName,
              licenseCode: pendingData.licenseCode,
              staffCount: 1,
              subscriptionTier: 'basic',
              status: 'active',
            });

            if (pharmacyId) {
              await addBranch({
                pharmacyId: pharmacyId,
                name: 'Main Branch',
                address: pendingData.locations,
              });
            }

            toast.success('Workspace created successfully!');
          }

          // Clean up session storage
          sessionStorage.removeItem('pendingPharmacyDetails');
        } catch (err: any) {
          console.error('Failed to process pending pharmacy registration:', err);
          toast.error('Failed to setup workspace. Please contact support.');
        }
      }

      // 3. Navigate to dashboard
      setStatus('Redirecting...');
      navigate(getHomePath(), { replace: true });
    };

    handleSSOCompletion();
  }, [isAuthenticated, user, navigate, createPharmacy, addBranch]);

  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute inset-0 isolate contain-strict -z-10 opacity-40'>
        <div className='bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsl(var(--muted))_0,hsla(0,0%,55%,.02)_50%,transparent_80%)] absolute top-0 right-0 h-[800px] w-[350px] -translate-y-1/2 rounded-full' />
        <div className='bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--accent))_0,transparent_100%)] absolute top-0 right-0 h-[800px] w-[150px] [translate:5%_-50%] rounded-full' />
      </div>

      {/* Floating Paths */}
      <div className='absolute inset-0 pointer-events-none'>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className='relative z-10 flex flex-col items-center max-w-sm text-center space-y-6'>
        <div className='w-20 h-20 bg-primary rounded-2xl flex items-center justify-center animate-pulse'>
          <Pill className='w-10 h-10 text-primary-foreground' />
        </div>

        <div className='space-y-2'>
          <h1 className='text-2xl font-bold font-display text-foreground tracking-tight'>
            PharmaCare
          </h1>
          <div className='flex items-center justify-center gap-2 text-muted-foreground font-medium'>
            <Loader2 className='w-4 h-4 animate-spin' />
            <p>{status}</p>
          </div>
        </div>
      </div>

      {/* Hidden Clerk Callback Component */}
      <div className='hidden'>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
