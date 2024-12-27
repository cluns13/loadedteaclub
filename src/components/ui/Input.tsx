import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  error,
  label,
  helpText,
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground-muted)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'input-base',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {(error || helpText) && (
        <p className={cn(
          'text-sm',
          error 
            ? 'text-red-500' 
            : 'text-[var(--foreground-dimmed)]'
        )}>
          {error || helpText}
        </p>
      )}
    </div>
  );
});
