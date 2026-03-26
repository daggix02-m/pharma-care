import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './index.css';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from './components/theme/ThemeProvider';

// Diagnostic logging
console.log('[Main] React version:', React.version);
console.log('[Main] Environment:', import.meta.env.MODE);
console.log('[Main] Using Convex Auth (Clerk removed)');

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error('Missing Convex URL (VITE_CONVEX_URL)');
}

console.log('[Main] Initializing Convex with URL:', CONVEX_URL);
const convex = new ConvexReactClient(CONVEX_URL);

function Main() {
  console.log('[Main] Rendering with Convex Auth');

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <ConvexProvider client={convex}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ConvexProvider>
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
