import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export interface ValidationErrorProps {
  errors?: Array<{
    path: string;
    message: string;
  }>;
  className?: string;
}

export function ValidationErrors({ 
  errors = [], 
  className 
}: ValidationErrorProps) {
  if (errors.length === 0) return null;

  return (
    <AnimatePresence>
      <div 
        className={cn(
          'bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 text-red-700',
          className
        )}
      >
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h4 className="font-semibold text-sm">Validation Errors</h4>
        </div>
        {errors.map((error, index) => (
          <motion.div
            key={`${error.path}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="text-sm flex items-start space-x-2"
          >
            <span className="font-medium capitalize">
              {error.path.replace(/([A-Z])/g, ' $1').toLowerCase()}:
            </span>
            <span>{error.message}</span>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}

export function useValidation(schema: any) {
  const validate = (data: any) => {
    try {
      schema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        };
      }
      throw error;
    }
  };

  return { validate };
}
