import React, { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ValidationErrors, useValidation } from '@/components/ui/ValidationErrors';
import { FileUpload } from '@/components/FileUpload/FileUpload';
import { BusinessValidationService } from '@/lib/services/businessValidationService';
import { US_STATES } from '@/lib/constants/states';
import { toast } from 'sonner';

const BusinessClaimSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().refine(
    phone => {
      try {
        const phoneUtil = PhoneNumberUtil.getInstance();
        const number = phoneUtil.parseAndKeepRawInput(phone, 'US');
        return phoneUtil.isValidNumber(number);
      } catch {
        return false;
      }
    },
    { message: 'Invalid phone number' }
  ),
  address: z.object({
    street: z.string().min(3, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.enum(US_STATES, { 
      errorMap: () => ({ message: 'Please select a valid state' }) 
    }),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
  }),
  businessLicenseDocument: z.string().url('Business license document is required')
});

export function BusinessClaimValidationForm({ 
  business, 
  onSubmit 
}: { 
  business: any, 
  onSubmit: (claimData: any) => Promise<void> 
}) {
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

  const [errors, setErrors] = useState<Array<{path: string, message: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { validate } = useValidation(BusinessClaimSchema);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updateNestedState = (path: string[], value: string) => {
      setFormData(prev => {
        const newState = { ...prev };
        let current: any = newState;
        path.slice(0, -1).forEach(key => {
          current = current[key];
        });
        current[path[path.length - 1]] = value;
        return newState;
      });
    };

    if (name.includes('.')) {
      updateNestedState(name.split('.'), value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validationResult = validate(formData);
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Additional business validation
      const integrityCheck = BusinessValidationService.checkBusinessIntegrity(formData);
      
      if (!integrityCheck.isComplete) {
        toast.warning('Additional Information Needed', {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Business Name"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          placeholder="Enter business name"
          required
        />
        <Input
          label="Contact Name"
          name="contactName"
          value={formData.contactName}
          onChange={handleChange}
          placeholder="Your full name"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Contact Email"
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Contact Phone"
          type="tel"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          placeholder="(123) 456-7890"
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Input
          label="Street Address"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
          placeholder="123 Main St"
          required
        />
        <Input
          label="City"
          name="address.city"
          value={formData.address.city}
          onChange={handleChange}
          placeholder="Anytown"
          required
        />
        <div className="space-y-2">
          <Select
            label="State"
            value={formData.address.state}
            onChange={(value) => handleChange({
              target: { 
                name: 'address.state', 
                value 
              }
            } as any)}
            options={US_STATES.map(state => ({ 
              value: state, 
              label: state 
            }))}
            placeholder="Select State"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="ZIP Code"
          name="address.zipCode"
          value={formData.address.zipCode}
          onChange={handleChange}
          placeholder="12345"
          required
        />
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

      <ValidationErrors errors={errors} />

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Business Claim'}
      </Button>
    </form>
  );
}
