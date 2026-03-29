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

const CONVEX_URL_PLACEHOLDER = 'your_convex_url_here';

function normalizeConvexUrl(rawValue?: string | null): string | null {
  if (!rawValue) {
    return null;
  }

  const value = rawValue.trim();
  if (!value || value === CONVEX_URL_PLACEHOLDER) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname.endsWith('.convex.site')) {
      parsed.hostname = parsed.hostname.replace(
        /\.convex\.site$/,
        '.convex.cloud',
      );
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function resolveConvexConfig(): { url: string | null; source: string | null } {
  const candidates = [
    { source: 'VITE_CONVEX_URL', value: import.meta.env.VITE_CONVEX_URL },
    {
      source: 'NEXT_PUBLIC_CONVEX_URL',
      value: import.meta.env.NEXT_PUBLIC_CONVEX_URL,
    },
    {
      source: 'VITE_CONVEX_SITE_URL',
      value: import.meta.env.VITE_CONVEX_SITE_URL,
    },
    { source: 'CONVEX_DEPLOYMENT', value: __CONVEX_URL_FROM_DEPLOYMENT__ },
  ] as const;

  for (const candidate of candidates) {
    const normalized = normalizeConvexUrl(candidate.value);
    if (normalized) {
      return { url: normalized, source: candidate.source };
    }
  }

  return { url: null, source: null };
}

function MissingConvexConfig() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          Configuration error
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Missing Convex URL. Set VITE_CONVEX_URL (recommended),
          NEXT_PUBLIC_CONVEX_URL, or CONVEX_DEPLOYMENT.
        </p>
      </section>
    </main>
  );
}

const { url: CONVEX_URL, source: CONVEX_URL_SOURCE } = resolveConvexConfig();

if (!CONVEX_URL) {
  console.error(
    '[Main] Missing Convex URL. Set VITE_CONVEX_URL (recommended), NEXT_PUBLIC_CONVEX_URL, or CONVEX_DEPLOYMENT.',
  );
} else {
  console.log(
    `[Main] Initializing Convex with URL from ${CONVEX_URL_SOURCE}:`,
    CONVEX_URL,
  );
}

const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null;

function Main() {
  console.log('[Main] Rendering with Convex Auth');

  if (!convex) {
    return (
      <React.StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <MissingConvexConfig />
          </ThemeProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  }

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
