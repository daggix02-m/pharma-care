// Custom logging utility to control debug information visibility
// This ensures that logs are only visible in development environments
// or when explicitly enabled in system settings.

const isDev = import.meta.env.DEV;
const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG === 'true';

const logger = {
  log: (...args: unknown[]) => {
    if (isDev || isDebugEnabled) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev || isDebugEnabled) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // We always want to see errors in the console for support purposes,
    // but we can sanitize sensitive data if needed.
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev || isDebugEnabled) {
      console.debug(...args);
    }
  },
  // Specialized method for API requests to avoid logging sensitive body data
  api: (method: string, url: string) => {
    if (isDev || isDebugEnabled) {
      console.log(`📡 [API] ${method} ${url}`);
    }
  },
};

export default logger;
