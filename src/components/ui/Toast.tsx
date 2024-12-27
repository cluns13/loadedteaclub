import { Fragment, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { LoadingButton } from './LoadingButton';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = 'success',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isShowing, setIsShowing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowing(false);
      setTimeout(onClose, 300); // Wait for animation to finish
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-400" />,
  };

  const backgrounds = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <Transition
      show={isShowing}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`rounded-xl border p-4 shadow-lg backdrop-blur-xl ${backgrounds[type]}`}
        >
          <div className="flex items-start gap-3">
            {icons[type]}
            <p className="text-sm text-[var(--foreground)]">{message}</p>
            <LoadingButton
              onClick={() => {
                setIsShowing(false);
                setTimeout(onClose, 300);
              }}
              variant="ghost"
              size="sm"
              className="p-0.5 -my-1 -mr-1"
            >
              <X className="h-4 w-4" />
            </LoadingButton>
          </div>
        </div>
      </div>
    </Transition>
  );
}
