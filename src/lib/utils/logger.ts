export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.context}] ${message}`;
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage(message), ...args);
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage(message), error);
    
    // In a real-world scenario, you might want to add error tracking
    // For example, sending to Sentry, LogRocket, or another error tracking service
    if (error) {
      // Optionally log full error details
      console.error(error);
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(message), ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(message), ...args);
    }
  }
}
