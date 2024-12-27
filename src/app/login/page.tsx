'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { LiquidBackground } from '@/components/LiquidBackground';
import { FloatingElements } from '@/components/FloatingElements';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push(callbackUrl);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] relative overflow-hidden">
      <LiquidBackground />
      <FloatingElements />

      <main className="relative min-h-[100svh] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Sign in to manage your account
            </p>
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-xl rounded-3xl" />
            <div className="relative p-8 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl 
                             text-white placeholder-white/50 focus:outline-none focus:ring-2 
                             focus:ring-[#24C6DC] focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl 
                             text-white placeholder-white/50 focus:outline-none focus:ring-2 
                             focus:ring-[#24C6DC] focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm text-white text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent 
                           text-sm font-medium rounded-xl text-white bg-[#24C6DC] hover:bg-[#20b3c7] 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24C6DC] 
                           transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Sign in'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-white/70">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/register"
                      className="font-medium text-[#24C6DC] hover:text-[#20b3c7] transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
