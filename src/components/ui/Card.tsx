import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass';
  clickable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  clickable = false,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'card',
        {
          'cursor-pointer': clickable,
        },
        className
      )}
      {...props}
    >
      {variant === 'glass' && <div className="card-glass" />}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
});
