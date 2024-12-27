import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface SmartFormOptions<T> {
  initialData: T;
  onSubmit: (data: T) => Promise<void>;
  validationSchema?: any;
}

export function useSmartForm<T>({ 
  initialData, 
  onSubmit, 
  validationSchema 
}: SmartFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateField = useCallback((name: string, value: any) => {
    if (!validationSchema) return true;

    try {
      validationSchema.shape[name].parse(value);
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error.errors[0].message
      }));
      return false;
    }
  }, [validationSchema, errors]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Micro-animation trigger
    const inputElement = e.target;
    inputElement.classList.add('animate-pulse-subtle');
    setTimeout(() => {
      inputElement.classList.remove('animate-pulse-subtle');
    }, 300);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    validateField(name, value);
  }, [validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    // Simulated progress
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    };

    try {
      simulateProgress();

      // Full form validation
      if (validationSchema) {
        validationSchema.parse(formData);
      }

      await onSubmit(formData);
      
      toast.success('Submission Successful', {
        description: 'Your form has been processed',
        duration: 2000
      });
    } catch (error) {
      toast.error('Submission Failed', {
        description: error.message
      });
      
      // Highlight errors
      if (error.errors) {
        const newErrors = {};
        error.errors.forEach(err => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  }, [formData, onSubmit, validationSchema]);

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    errors,
    isSubmitting,
    progress
  };
}
