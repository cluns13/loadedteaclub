import React, { ComponentType, FunctionComponent, LazyExoticComponent } from 'react';

export class PerformanceOptimizer {
  // Debounce function to limit rapid function calls
  static debounce<F extends (...args: any[]) => any>(
    func: F, 
    delay: number
  ): (...args: Parameters<F>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<F>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    };
  }

  // Throttle function to limit function calls per time period
  static throttle<F extends (...args: any[]) => any>(
    func: F, 
    limit: number
  ): (...args: Parameters<F>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<F>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Measure and log performance of a function
  static measurePerformance<F extends (...args: any[]) => any>(
    func: F, 
    label: string
  ): (...args: Parameters<F>) => ReturnType<F> {
    return (...args: Parameters<F>) => {
      const start = performance.now();
      const result = func(...args);
      const end = performance.now();
      
      console.log(`Performance of ${label}: ${end - start}ms`);
      
      return result;
    };
  }

  // Prefetch resources for faster loading
  static prefetchResources(urls: string[]): void {
    if (typeof window !== 'undefined') {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }
  }

  // Client-side code splitting and lazy loading
  static lazyLoad<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>, 
    fallback?: React.ReactNode
  ): LazyExoticComponent<T> {
    return React.lazy(() => 
      importFn().then(module => ({ default: module.default as T }))
    );
  }
}

// Utility hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({});

  const trackMetric = (metricName: string, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [metricName]: value
    }));
  };

  return { metrics, trackMetric };
}
