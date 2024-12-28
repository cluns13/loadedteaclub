'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function BusinessRegistration() {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const { businessName, ownerName, email, phone } = formData;
      if (!businessName || !ownerName || !email || !phone) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // TODO: Replace with actual API call
      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Registration Successful!');
        router.push('/business/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Business Registration
          </h2>
          <p className="text-gray-300">
            Join our nutrition club network and grow your business
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="businessName"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={handleInputChange}
            className="bg-white/10 text-white border-white/20"
            required
          />
          <Input
            name="ownerName"
            placeholder="Owner's Name"
            value={formData.ownerName}
            onChange={handleInputChange}
            className="bg-white/10 text-white border-white/20"
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Business Email"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-white/10 text-white border-white/20"
            required
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="bg-white/10 text-white border-white/20"
            required
          />
          <Input
            name="location"
            placeholder="Business Address"
            value={formData.location}
            onChange={handleInputChange}
            className="bg-white/10 text-white border-white/20"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
          >
            {isLoading ? 'Registering...' : 'Register Your Business'}
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-400">
            By registering, you agree to our 
            <a href="/terms" className="text-teal-400 ml-1 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
