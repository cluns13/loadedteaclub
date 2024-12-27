'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('email', { 
        email, 
        redirect: false 
      });

      if (result?.error) {
        toast.error('Sign In Failed', {
          description: result.error
        });
      } else {
        toast.success('Check your email', {
          description: 'A sign-in link has been sent'
        });
      }
    } catch (error) {
      toast.error('Sign In Error', {
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      toast.error('Google Sign In Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Sign In to Loaded Tea Clubs
          </h2>
          <p className="text-gray-400">
            Access your rewards and check-ins
          </p>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <Input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="bg-white/10 text-white border-white/20"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
          >
            {isLoading ? 'Sending...' : 'Sign In with Email'}
          </Button>
        </form>

        <div className="flex items-center justify-center space-x-4">
          <div className="h-px bg-white/20 flex-grow"></div>
          <span className="text-gray-400">or</span>
          <div className="h-px bg-white/20 flex-grow"></div>
        </div>

        <Button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20"
        >
          Sign In with Google
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            By signing in, you agree to our 
            <a href="/terms" className="text-teal-400 ml-1 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
