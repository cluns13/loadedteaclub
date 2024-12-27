import { useState } from 'react';
import { Check, Store, Mail, Phone, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { LoadingButton } from '../ui/LoadingButton';
import { Input } from '../ui/Input';

const steps = [
  {
    id: 'claim',
    name: 'Claim Business',
    description: 'Verify ownership of your business',
    icon: Store,
  },
  {
    id: 'verify',
    name: 'Verify Identity',
    description: 'Confirm your identity and business ownership',
    icon: Check,
  },
  {
    id: 'contact',
    name: 'Contact Info',
    description: 'Add your business contact information',
    icon: Mail,
  },
  {
    id: 'details',
    name: 'Business Details',
    description: 'Complete your business profile',
    icon: MapPin,
  },
];

export function BusinessOnboarding() {
  const [currentStep, setCurrentStep] = useState('claim');
  const [loading, setLoading] = useState(false);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const handleNext = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="py-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = step.id === currentStep;
            const isComplete = getCurrentStepIndex() > index;
            
            return (
              <div key={step.id} className="flex-1">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${
                      isCurrent
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : isComplete
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-[var(--border)] text-[var(--foreground-muted)]'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-1/2 w-full h-0.5 top-6 -z-10 ${
                        isComplete ? 'bg-green-500' : 'bg-[var(--border)]'
                      }`}
                    />
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {step.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        {currentStep === 'claim' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Claim Your Business</h3>
            <p className="text-[var(--foreground-muted)]">
              Enter your business details to start the verification process.
            </p>
            <Input
              label="Business Name"
              placeholder="Enter your business name"
            />
            <Input
              label="Business Address"
              placeholder="Enter your business address"
            />
            <div className="flex justify-end">
              <LoadingButton
                onClick={handleNext}
                isLoading={loading}
              >
                Continue
              </LoadingButton>
            </div>
          </div>
        )}

        {currentStep === 'verify' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Verify Your Identity</h3>
            <p className="text-[var(--foreground-muted)]">
              We'll need to verify your identity and business ownership.
            </p>
            <Input
              label="Business Registration Number"
              placeholder="Enter your business registration number"
            />
            <Input
              label="Tax ID"
              placeholder="Enter your tax ID"
            />
            <div className="flex justify-end space-x-4">
              <LoadingButton
                variant="ghost"
                onClick={() => setCurrentStep('claim')}
              >
                Back
              </LoadingButton>
              <LoadingButton
                onClick={handleNext}
                isLoading={loading}
              >
                Continue
              </LoadingButton>
            </div>
          </div>
        )}

        {currentStep === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <p className="text-[var(--foreground-muted)]">
              Add your business contact information.
            </p>
            <Input
              label="Business Email"
              type="email"
              placeholder="Enter your business email"
            />
            <Input
              label="Business Phone"
              type="tel"
              placeholder="Enter your business phone"
            />
            <div className="flex justify-end space-x-4">
              <LoadingButton
                variant="ghost"
                onClick={() => setCurrentStep('verify')}
              >
                Back
              </LoadingButton>
              <LoadingButton
                onClick={handleNext}
                isLoading={loading}
              >
                Continue
              </LoadingButton>
            </div>
          </div>
        )}

        {currentStep === 'details' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Business Details</h3>
            <p className="text-[var(--foreground-muted)]">
              Complete your business profile.
            </p>
            <Input
              label="Business Description"
              placeholder="Enter a description of your business"
              as="textarea"
            />
            <Input
              label="Business Hours"
              placeholder="Enter your business hours"
            />
            <div className="flex justify-end space-x-4">
              <LoadingButton
                variant="ghost"
                onClick={() => setCurrentStep('contact')}
              >
                Back
              </LoadingButton>
              <LoadingButton
                onClick={handleNext}
                isLoading={loading}
              >
                Complete Setup
              </LoadingButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
