'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Store, Loader2 } from 'lucide-react';

type UserRole = 'USER' | 'BUSINESS_OWNER';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: any;
}

const roleOptions: RoleOption[] = [
  {
    id: 'USER',
    title: 'Find Tea Shops',
    description: 'I want to discover and review loaded tea shops',
    icon: Search
  },
  {
    id: 'BUSINESS_OWNER',
    title: 'List My Business',
    description: 'I own a loaded tea shop and want to manage my listing',
    icon: Store
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as UserRole,
    businessInfo: {
      businessName: '',
      phone: ''
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate business info if business owner
    if (formData.role === 'BUSINESS_OWNER') {
      if (!formData.businessInfo.businessName || !formData.businessInfo.phone) {
        setError('Business name and phone are required');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          ...(formData.role === 'BUSINESS_OWNER' && {
            businessInfo: formData.businessInfo
          })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Redirect to login page
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] relative">
      <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join TeaFinder to discover or list loaded tea shops
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Choose Your Role</h2>
                <p className="text-muted-foreground">
                  Select how you want to use TeaFinder
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleRoleSelect(option.id)}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      formData.role === option.id
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <option.icon className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                    <p className="text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                      value={formData.businessInfo.businessName}
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
                      value={formData.businessInfo.phone}
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
                  disabled={isLoading}
                  className="button flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
