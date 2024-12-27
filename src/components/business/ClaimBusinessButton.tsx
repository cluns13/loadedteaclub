'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Building2 } from 'lucide-react';
import { LoadingButton } from '../ui/LoadingButton';

interface ClaimBusinessButtonProps {
  businessId: string;
  businessName: string;
  claimed: boolean;
}

export default function ClaimBusinessButton({ 
  businessId, 
  businessName,
  claimed 
}: ClaimBusinessButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaimClick = async () => {
    if (!session) {
      const returnUrl = `/claim/${businessId}`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/business/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          businessName,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to claim business');
      }

      router.push('/dashboard?tab=claims');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim business');
    } finally {
      setIsLoading(false);
    }
  };

  if (claimed) {
    return (
      <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Claimed
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <LoadingButton isLoading variant="secondary" disabled>
        Loading...
      </LoadingButton>
    );
  }

  return (
    <div>
      <LoadingButton
        onClick={handleClaimClick}
        isLoading={isLoading}
        variant="secondary"
        fullWidth
      >
        <Building2 className="h-4 w-4 mr-2" />
        {session ? 'Claim This Business' : 'Sign in to Claim'}
      </LoadingButton>

      {error && (
        <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-white text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
