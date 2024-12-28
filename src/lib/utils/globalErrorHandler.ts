import { Logger } from './logger';
import React from 'react';

const logger = new Logger('GlobalErrorHandler');

export function setupGlobalErrorHandlers() {
  // Client-side unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise Rejection', { 
        reason: event.reason,
        promise: event.promise 
      });
      
      // Optionally prevent default error logging
      event.preventDefault();
    });

    // Client-side uncaught exceptions
    window.addEventListener('error', (event) => {
      logger.error('Uncaught Error', { 
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Optionally prevent default error logging
      event.preventDefault();
    });
  }

  // Server-side error handling
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error });
      
      // Graceful shutdown
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
    });
  }
}

// Error boundary for React components
export function withErrorBoundary<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logger.error('React Component Error', { error, errorInfo });
    }

    render() {
      if (this.state.hasError) {
        return React.createElement('h1', null, 'Something went wrong.');
      }

      return React.createElement(WrappedComponent, this.props);
    }
  };
}
