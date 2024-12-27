import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

interface BaseButtonProps {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: 'button';
  };

type ButtonAsAnchor = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    as: 'a';
    href: string;
  };

type LoadingButtonProps = ButtonAsButton | ButtonAsAnchor;

export const LoadingButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, LoadingButtonProps>(
  (props, ref) => {
    const {
      isLoading = false,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      children,
      className,
      as = 'button',
      ...rest
    } = props;

    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90':
          variant === 'primary',
        'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/90':
          variant === 'secondary',
        'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]': variant === 'ghost',
        'h-9 px-4 py-2': size === 'sm',
        'h-10 px-6 py-2': size === 'md',
        'h-12 px-8 py-3': size === 'lg',
        'w-full': fullWidth,
        'pointer-events-none': isLoading,
      },
      className
    );

    if (as === 'a') {
      const { href, ...anchorProps } = rest as ButtonAsAnchor;
      return (
        <a
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={baseClasses}
          {...anchorProps}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            children
          )}
        </a>
      );
    }

    return (
      <button
        type="button"
        ref={ref as React.Ref<HTMLButtonElement>}
        className={baseClasses}
        disabled={isLoading}
        {...(rest as ButtonAsButton)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
