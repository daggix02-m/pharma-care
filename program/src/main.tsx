import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './index.css';

import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { ThemeProvider } from './components/theme/ThemeProvider';

// Diagnostic logging for Fast Refresh
console.log('[Main] React version:', React.version);
console.log('[Main] Environment:', import.meta.env.MODE);
console.log(
  '[Main] Clerk Key:',
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
    ? `${import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.substring(0, 15)}...`
    : 'MISSING'
);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key (VITE_CLERK_PUBLISHABLE_KEY)');
}

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error('Missing Convex URL (VITE_CONVEX_URL)');
}

console.log('[Main] Initializing Convex with URL:', CONVEX_URL);
const convex = new ConvexReactClient(CONVEX_URL);

interface ClerkErrorUIProps {
  error: Error | null;
  onRetry: () => void;
}

const ClerkErrorUI = ({ error, onRetry }: ClerkErrorUIProps) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='max-w-md w-full p-8 bg-card rounded-lg shadow-lg text-center border border-border'>
        <div className='w-16 h-16 mx-auto mb-4 text-destructive'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
            />
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-foreground mb-2'>Authentication Error</h2>
        <p className='text-muted-foreground mb-6'>
          {error?.message || 'Failed to initialize authentication. Please try again.'}
        </p>
        <div className='flex gap-3 justify-center'>
          <button
            onClick={onRetry}
            className='px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium'
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className='px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium'
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

function Main() {
  const [clerkError, setClerkError] = useState<Error | null>(null);

  const handleRetry = () => {
    setClerkError(null);
    window.location.reload();
  };

  console.log('[Main] Rendering ClerkProvider');

  // If there's a Clerk error, show the error UI instead
  if (clerkError) {
    return <ClerkErrorUI error={clerkError} onRetry={handleRetry} />;
  }

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY!}
          appearance={{
            variables: {
              colorPrimary: 'hsl(var(--primary))',
              colorBackground: 'hsl(var(--background))',
              colorText: 'hsl(var(--foreground))',
              colorTextSecondary: 'hsl(var(--muted-foreground))',
              colorInputBackground: 'hsl(var(--card))',
              colorInputBorder: 'hsl(var(--border))',
              colorDanger: 'hsl(var(--destructive))',
              fontFamily: 'var(--font-sans)',
              borderRadius: 'var(--radius)',
            },
            elements: {
              // OAuth buttons
              socialButtonsBlockButton: 'border-border bg-card hover:bg-muted transition-colors',
              socialButtonsBlockButtonText: 'text-foreground font-semibold',
              socialButtonsProviderIcon: 'text-foreground',
              // Separator
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground text-sm',
              // Form container
              card: 'bg-card border-border shadow-sm',
              // Header
              headerTitle: 'text-foreground font-display',
              headerSubtitle: 'text-muted-foreground',
              // Primary button
              formButtonPrimary:
                'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold',
              // Input fields
              formFieldInput:
                'bg-card border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all',
              formFieldLabel:
                'text-muted-foreground font-bold uppercase text-[10px] tracking-widest',
              formFieldErrorText: 'text-destructive text-sm',
              // Footer
              footerActionText: 'text-muted-foreground',
              footerActionLink: 'text-primary hover:text-primary/80 font-bold',
              // Alternative methods
              alternativeMethodsBlockButton: 'border-border bg-card hover:bg-muted text-foreground',
              // Sign up link
              signUpLink: 'text-primary hover:text-primary/80 font-bold',
              // Back button
              backButton: 'text-muted-foreground hover:text-foreground',
              // Identity preview
              identityPreviewText: 'text-foreground',
              identityPreviewEditButton: 'text-primary hover:text-primary/80',
            },
          }}
          afterSignOutUrl='/'
          signInUrl='/auth/login'
          signUpUrl='/auth/signup'
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = ReactDOM.createRoot(rootElement);
root.render(<Main />);
