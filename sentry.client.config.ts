import * as Sentry from "@sentry/nextjs";
import { BrowserOptions, ErrorEvent, Event } from "@sentry/browser";

// Custom error filter function
const shouldReportError = (event: Event): boolean => {
  // Ignore specific error types or patterns
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'NetworkError',
    'AbortError',
    /Failed to fetch/i,
    /Load failed/i
  ];

  const errorMessage = event.message || '';
  const stackTrace = event.exception?.values?.[0]?.stacktrace?.frames?.map(
    frame => frame.filename || ''
  ).join(' ');

  // Check if error matches any ignored patterns
  return !ignoredErrors.some(pattern => 
    (typeof pattern === 'string' && errorMessage.includes(pattern)) ||
    (pattern instanceof RegExp && (
      pattern.test(errorMessage) || 
      (stackTrace && pattern.test(stackTrace))
    ))
  );
};

// Performance monitoring configuration
const performanceMonitoringOptions = {
  // Trace important transactions
  tracePropagationTargets: [
    'localhost', 
    /^https:\/\/tea-finder\.vercel\.app/,
    /^https:\/\/api\.tea-finder\.com/
  ],
  
  // Sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Specific transaction sampling
  traceSampler: (samplingContext: Sentry.SamplingContext) => {
    // Custom sampling logic
    const { transactionContext } = samplingContext;
    
    // Higher sampling for critical routes
    const criticalRoutes = [
      '/checkout', 
      '/claims', 
      '/admin'
    ];

    if (transactionContext.name && 
        criticalRoutes.some(route => 
          transactionContext.name.includes(route)
        )) {
      return 1.0; // 100% sampling for critical routes
    }

    return 0.1; // Default sampling rate
  }
};

// Sentry configuration options
const sentryOptions: BrowserOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Error filtering
  beforeSend: (event: Event, hint?: ErrorEvent) => {
    // Additional error filtering and enrichment
    if (!shouldReportError(event)) {
      return null; // Suppress error
    }

    // Enrich error event with additional context
    if (hint?.originalException) {
      const originalError = hint.originalException;
      
      // Add custom error properties
      if (originalError instanceof Error) {
        event.extra = {
          ...event.extra,
          errorName: originalError.name,
          errorStack: originalError.stack
        };
      }
    }

    return event;
  },
  
  // Ignore common/non-critical errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'NetworkError',
    'AbortError',
    /Failed to fetch/i,
    /Load failed/i
  ],
  
  // Error sampling
  sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
  
  // Performance monitoring
  ...performanceMonitoringOptions,
  
  // Additional configuration
  integrations: [
    // Default integrations
    ...Sentry.defaultIntegrations,
    
    // Browser performance monitoring
    new Sentry.BrowserTracing(),
    
    // Replay session recording (optional, can be resource-intensive)
    ...(process.env.NODE_ENV === 'production' 
      ? [new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
          sampleRate: 0.1
        })] 
      : [])
  ]
};

// Initialize Sentry
Sentry.init(sentryOptions);

// Optional: Add global error handler
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});

// Optional: Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
});

export default sentryOptions;
