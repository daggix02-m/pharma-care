import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-up'>
          <div className='w-20 h-20 rounded-[2rem] bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6'>
            <AlertTriangle className='h-10 w-10 text-red-500' />
          </div>
          <h2 className='text-3xl font-black text-slate-900 dark:text-slate-50 mb-2'>
            Something went wrong
          </h2>
          <p className='text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed'>
            We encountered an unexpected error. This has been logged and we&apos;re looking into it.
          </p>
          <div className='flex flex-col sm:flex-row items-center gap-3'>
            <Button
              onClick={() => window.location.reload()}
              className='rounded-xl h-12 px-8 bg-slate-900 text-white gap-2'
            >
              <RefreshCw className='h-4 w-4' /> Try Refreshing
            </Button>
            <Button
              variant='outline'
              onClick={() => (window.location.href = '/')}
              className='rounded-xl h-12 px-8 border-slate-200 gap-2'
            >
              <Home className='h-4 w-4' /> Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className='mt-12 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left max-w-2xl overflow-auto'>
              <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
                Developer Info
              </p>
              <code className='text-xs text-red-600 font-mono'>{this.state.error?.toString()}</code>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
