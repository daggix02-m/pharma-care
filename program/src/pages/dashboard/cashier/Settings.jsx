import React from 'react';
import { ProfileSettings } from '@/components/shared/ProfileSettings';

export function Settings() {
  return (
    <div className='space-y-6 p-4 sm:p-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground'>Manage your account and preferences.</p>
      </div>

      <ProfileSettings userRole='Cashier' />
    </div>
  );
}
