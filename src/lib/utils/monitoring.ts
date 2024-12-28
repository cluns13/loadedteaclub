import { performance } from 'perf_hooks';
import { Logger } from './logger';

export interface MonitoringOptions {
  logThreshold?: number;  // Log operations slower than this (ms)
  sampleRate?: number;    // Percentage of operations to monitor
}

export class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private logger: Logger;
  private options: MonitoringOptions;

  private constructor(options: MonitoringOptions = {}) {
    this.logger = new Logger('DatabaseMonitor');
    this.options = {
      logThreshold: options.logThreshold ?? 100,  // Default 100ms
      sampleRate: options.sampleRate ?? 0.1,      // Default 10% sampling
    };
  }

  public static getInstance(options?: MonitoringOptions): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor(options);
    }
    return DatabaseMonitor.instance;
  }

  async monitor<T>(
    operation: string, 
    fn: () => Promise<T>, 
    context?: Record<string, any>
  ): Promise<T> {
    // Probabilistic sampling
    const shouldMonitor = Math.random() < this.options.sampleRate;
    
    if (!shouldMonitor) {
      return fn();
    }

    const start = performance.now();
    
    try {
      const result = await fn();
      
      const duration = performance.now() - start;
      
      // Log slow operations
      if (duration > this.options.logThreshold!) {
        this.logger.warn(`Slow database operation: ${operation}`, {
          duration,
          context,
        });
      }
      
      // Optional: Send to monitoring service
      this.recordMetrics(operation, duration);
      
      return result;
    } catch (error) {
      this.logger.error(`Database operation failed: ${operation}`, {
        error,
        context,
      });
      
      // Optional: Report error to monitoring service
      this.reportError(operation, error);
      
      throw error;
    }
  }

  private recordMetrics(operation: string, duration: number) {
    // Placeholder for actual metrics recording
    // Could integrate with services like Datadog, New Relic, etc.
    console.log(`Metric: ${operation} took ${duration}ms`);
  }

  private reportError(operation: string, error: unknown) {
    // Placeholder for error reporting
    // Could integrate with error tracking services
    console.error(`Error in ${operation}:`, error);
  }
}

// Decorator for easy monitoring
export function MonitorDatabase(
  options?: { 
    operation?: string, 
    context?: Record<string, any> 
  }
) {
  return function (
    target: any, 
    propertyKey: string, 
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = DatabaseMonitor.getInstance();
      const operation = options?.operation ?? `${target.constructor.name}.${propertyKey}`;
      
      return monitor.monitor(
        operation, 
        () => originalMethod.apply(this, args),
        { 
          ...options?.context,
          args: args.map(arg => typeof arg),
        }
      );
    };

    return descriptor;
  };
}
