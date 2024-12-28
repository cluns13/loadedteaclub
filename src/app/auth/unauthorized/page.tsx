'use client';

import { Button } from '@/components/ui/Button';
import { signIn } from 'next-auth/react';

export default function Unauthorized() {
  const handleSignIn = () => signIn();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 max-w-md w-full space-y-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Unauthorized Access
        </h2>
        <p className="text-gray-400 mb-6">
          You do not have permission to access this page. 
          Please sign in or request the appropriate access.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={handleSignIn}
            className="w-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
          >
            Sign In
          </Button>

          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
