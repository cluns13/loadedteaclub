'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelector, UserRole } from './RoleSelector';
import { Loader2 } from 'lucide-react';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  businessInfo?: {
    businessName?: string;
    phone?: string;
  };
}

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create account');
      }

      router.push('/login?message=Account created successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {step === 1 ? (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Choose Your Role</h2>
            <p className="text-muted-foreground">
              Select how you want to use TeaFinder
            </p>
          </div>
          <RoleSelector
            selectedRole={formData.role}
            onSelectRole={handleRoleSelect}
          />
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input w-full"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input w-full"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input w-full"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          {formData.role === 'BUSINESS_OWNER' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessInfo?.businessName || ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    businessInfo: {
                      ...prev.businessInfo,
                      businessName: e.target.value
                    }
                  }))}
                  className="input w-full"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.businessInfo?.phone || ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    businessInfo: {
                      ...prev.businessInfo,
                      phone: e.target.value
                    }
                  }))}
                  className="input w-full"
                  placeholder="(123) 456-7890"
                />
              </div>
            </>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="button-secondary flex-1"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="button flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
