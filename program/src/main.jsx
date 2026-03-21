import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './index.css';

import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';

// Diagnostic logging for Fast Refresh
console.log('[Main] React version:', React.version);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key (VITE_CLERK_PUBLISHABLE_KEY)");
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const ClerkErrorUI = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 3.382l-3.666 2m4.612-2l2.667-2c.87-1.54-1.834-3.382-3.382-5.37l-4 2.666M11 17h2m-2-4h.01M5.83 15H4.678" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-6">
          {error || "Failed to initialize authentication. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

const ClerkLoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin">
          <div className="w-12 h-12 bg-indigo-600 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PharmaCare</h2>
        <p className="text-gray-600">Setting up authentication...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we secure your session</p>
      </div>
    </div>
  );
};

function Main() {
  const [isClerkLoading, setIsClerkLoading] = useState(true);
  const [clerkError, setClerkError] = useState(null);

  const handleRetry = () => {
    setClerkError(null);
    setIsClerkLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <React.StrictMode>
      <ErrorBoundary
        fallback={
          clerkError ? (
            <ClerkErrorUI error={clerkError.message} onRetry={handleRetry} />
          ) : null
        }
      >
        {isClerkLoading ? (
          <ClerkLoadingSpinner />
        ) : (
          <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            afterSignOutUrl="/"
            onError={(error) => {
              console.error('[Clerk] Initialization error:', error);
              setClerkError(error);
              setIsClerkLoading(false);
            }}
            onAfterSignInUrl="/"
            onAfterSignUpUrl="/"
          >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
              <App />
            </ConvexProviderWithClerk>
          </ClerkProvider>
        )}
      </ErrorBoundary>
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
