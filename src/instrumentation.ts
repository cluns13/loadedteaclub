import * as Sentry from "@sentry/nextjs";

export function register() {
  Sentry.init({
    dsn: "https://eb8641d40c8add9117f9063e806ffd4d@o4508543481806848.ingest.us.sentry.io/4508543492227072",
    
    // Performance monitoring
    tracesSampleRate: 0.1,
    
    // Error sampling
    sampleRate: 1.0,
    
    // Ignore common/non-critical errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'NetworkError when attempting to fetch resource',
      'AbortError',
      'Request was interrupted',
      /^Unhandled promise rejection/
    ],
    
    // Attach server context (optional)
    beforeSend(event) {
      // You can modify or filter events here
      return event;
    }
  });
}
