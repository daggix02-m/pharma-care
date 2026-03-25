'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, ClockIcon, MailIcon, BuildingIcon, UserRoundIcon } from 'lucide-react';
import { AuthLayout } from '@/components/shared/AuthLayout';

export function PharmacyRequestConfirmPage() {
  const request = JSON.parse(localStorage.getItem('pharmacyRequest') || '{}');
  const pharmacyName = request.pharmacyName || 'Your Pharmacy';
  const branchName = request.branchName || '';
  const managerName = request.managerName || '';
  const managerEmail = request.managerEmail || '';

  return (
    <AuthLayout>
      <div className='space-y-6 text-center'>
        <div className='flex justify-center mb-6'>
          <div className='bg-accent/10 text-accent-foreground p-6 rounded-full border border-accent/20'>
            <CheckCircleIcon className='size-16' />
          </div>
        </div>

        <div className='space-y-4 mb-8'>
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>Request Submitted</h1>
          <p className='text-primary font-semibold text-lg'>{pharmacyName}</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8'>
          <div className='p-4 bg-card/50 rounded-2xl border border-input space-y-3'>
            <h3 className='text-[10px] font-bold text-primary uppercase tracking-widest'>
              Submitted Details
            </h3>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <UserRoundIcon className='size-4 text-muted-foreground' />
                <span className='text-sm font-medium text-foreground'>{managerName}</span>
              </div>
              <div className='flex items-center gap-3'>
                <MailIcon className='size-4 text-muted-foreground' />
                <span className='text-sm font-medium text-foreground'>{managerEmail}</span>
              </div>
              <div className='flex items-center gap-3'>
                <BuildingIcon className='size-4 text-muted-foreground' />
                <span className='text-sm font-medium text-foreground'>
                  {pharmacyName}
                  {branchName ? ` - ${branchName}` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className='p-4 bg-primary rounded-2xl text-primary-foreground space-y-3'>
            <h3 className='text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest'>
              Next Step
            </h3>
            <div className='flex items-start gap-3'>
              <div className='bg-primary-foreground/20 rounded-full p-1 mt-0.5'>
                <ClockIcon className='size-4' />
              </div>
              <p className='text-sm font-medium leading-snug'>
                The system administrator will review your application. Check your email for the
                Branch ID.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-muted/50 rounded-2xl p-6 text-left space-y-4 mb-8 border border-input'>
          <h2 className='font-bold text-foreground'>Process Overview</h2>
          <div className='space-y-4'>
            {[
              {
                title: 'Admin Verification',
                desc: 'Your pharmacy request is being verified against our standards.',
              },
              {
                title: 'Branch ID Issuance',
                desc: `A secure Branch ID will be sent to ${managerEmail || 'your email'}.`,
              },
              {
                title: 'Complete Setup',
                desc: 'Use the ID on the signup page to activate your manager account.',
              },
            ].map((step, i) => (
              <div key={i} className='flex gap-4'>
                <span className='flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold'>
                  {i + 1}
                </span>
                <div>
                  <p className='text-sm font-semibold text-foreground'>{step.title}</p>
                  <p className='text-xs text-muted-foreground'>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-4'>
          <Button
            className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-sm'
            asChild
          >
            <Link to='/auth/login'>Back to Login</Link>
          </Button>
          <p className='text-[11px] text-muted-foreground'>
            Return to the{' '}
            <Link to='/auth/signup' className='text-primary hover:underline'>
              signup page
            </Link>{' '}
            once you have your Branch ID.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
