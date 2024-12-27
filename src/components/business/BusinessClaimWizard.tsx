import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/FileUpload/FileUpload';
import { ValidationErrors } from '@/components/ui/ValidationErrors';
import { BusinessValidationService } from '@/lib/services/businessValidationService';
import { US_STATES } from '@/lib/constants/states';
import { toast } from 'sonner';

const STEPS = [
  { title: 'Business Basics', fields: ['businessName', 'contactName'] },
  { title: 'Contact Information', fields: ['contactEmail', 'contactPhone'] },
  { title: 'Business Address', fields: ['address.street', 'address.city', 'address.state', 'address.zipCode'] },
  { title: 'Documentation', fields: ['businessLicenseDocument'] }
];

export function BusinessClaimWizard({ 
  business, 
  onSubmit 
}: { 
  business: any, 
  onSubmit: (claimData: any) => Promise<void> 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: business.name || '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: business.address?.street || '',
      city: business.address?.city || '',
      state: business.address?.state || '',
      zipCode: business.address?.zipCode || ''
    },
    businessLicenseDocument: ''
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Array<{path: string, message: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCurrentStep = () => {
    const currentStepFields = STEPS[currentStep].fields;
    const stepErrors = currentStepFields
      .map(field => {
        const value = field.includes('.') 
          ? field.split('.').reduce((obj, key) => obj[key], formData)
          : formData[field];
        
        return !value 
          ? { path: field, message: `${field.replace('.', ' ')} is required` }
          : null;
      })
      .filter(Boolean);

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => 
        prev.includes(currentStep) 
          ? prev 
          : [...prev, currentStep]
      );
      setCurrentStep(Math.min(currentStep + 1, STEPS.length - 1));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const integrityCheck = BusinessValidationService.checkBusinessIntegrity(formData);
      
      if (!integrityCheck.isComplete) {
        toast.warning('Additional Information Recommended', {
          description: integrityCheck.issues.join(', ')
        });
      }

      await onSubmit(formData);
      toast.success('Business Claim Submitted', {
        description: 'Your claim is being processed'
      });
    } catch (error) {
      toast.error('Submission Failed', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              label="Business Name"
              name="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessName: e.target.value 
              }))}
              placeholder="Enter business name"
              required
            />
            <Input
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                contactName: e.target.value 
              }))}
              placeholder="Your full name"
              required
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <Input
              label="Contact Email"
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                contactEmail: e.target.value 
              }))}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Contact Phone"
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                contactPhone: e.target.value 
              }))}
              placeholder="(123) 456-7890"
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                address: { 
                  ...prev.address, 
                  street: e.target.value 
                } 
              }))}
              placeholder="123 Main St"
              required
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { 
                    ...prev.address, 
                    city: e.target.value 
                  } 
                }))}
                placeholder="Anytown"
                required
              />
              <Select
                label="State"
                value={formData.address.state}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  address: { 
                    ...prev.address, 
                    state: value 
                  } 
                }))}
                options={US_STATES.map(state => ({ 
                  value: state, 
                  label: state 
                }))}
                placeholder="Select State"
                required
              />
            </div>
            <Input
              label="ZIP Code"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                address: { 
                  ...prev.address, 
                  zipCode: e.target.value 
                } 
              }))}
              placeholder="12345"
              required
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <FileUpload
              purpose="business_license"
              label="Business License"
              onUploadComplete={(url) => {
                setFormData(prev => ({ 
                  ...prev, 
                  businessLicenseDocument: url 
                }));
              }}
              accept=".pdf,.jpg,.jpeg,.png"
              helpText="Upload a clear image of your business license"
              required
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* Progress Tracker */}
      <div className="flex justify-between mb-6">
        {STEPS.map((step, index) => (
          <div 
            key={step.title} 
            className={`flex-1 text-center relative ${
              index <= currentStep 
                ? 'text-primary' 
                : 'text-gray-300'
            }`}
          >
            <div 
              className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                completedSteps.includes(index)
                  ? 'bg-primary/10'
                  : index === currentStep
                    ? 'bg-primary/20'
                    : 'bg-gray-100'
              }`}
            >
              {completedSteps.includes(index) ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="font-bold">{index + 1}</span>
              )}
            </div>
            <span className="text-xs font-medium">{step.title}</span>
            {index < STEPS.length - 1 && (
              <div 
                className={`absolute top-4 left-1/2 w-full h-0.5 -translate-x-1/2 ${
                  index < currentStep 
                    ? 'bg-primary' 
                    : 'bg-gray-200'
                }`} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <ValidationErrors 
          errors={errors} 
          className="mt-4" 
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 w-4 h-4" /> Previous
          </Button>
        )}
        
        {currentStep < STEPS.length - 1 ? (
          <Button 
            onClick={handleNextStep}
            className="ml-auto flex items-center"
          >
            Next <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Claim'}
          </Button>
        )}
      </div>
    </div>
  );
}
