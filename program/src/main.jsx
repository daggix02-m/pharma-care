import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './index.css';

import { ClerkProvider } from '@clerk/clerk-react';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';

// Diagnostic logging for Fast Refresh
console.log('[Main] React version:', React.version);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key (VITE_CLERK_PUBLISHABLE_KEY)");
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
