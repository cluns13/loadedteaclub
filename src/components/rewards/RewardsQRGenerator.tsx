'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { createHash } from 'crypto';

// Utility function to generate secure token
function generateSecureToken(): string {
  const timestamp = Date.now().toString();
  const randomPart = Math.random().toString(36).substring(2);
  return createHash('sha256')
    .update(timestamp + randomPart)
    .digest('hex');
}

interface RewardsQRGeneratorProps {
  clubId: string;
  redemptionType: 'FREE_DRINK' | 'DISCOUNT';
}

export function RewardsQRGenerator({ 
  clubId, 
  redemptionType 
}: RewardsQRGeneratorProps) {
  const { data: session } = useSession();
  const [qrData, setQrData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQRToken = async () => {
    if (!session?.user) {
      setError('Please log in to generate a redemption token');
      return;
    }

    try {
      // Generate a secure, time-limited token
      const token = generateSecureToken();
      const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Create QR payload
      const payload = JSON.stringify({
        userId: session.user.id,
        clubId,
        token,
        type: redemptionType,
        expiresAt: expiration.toISOString()
      });

      setQrData(payload);
      setExpiresAt(expiration);
      setError(null);
    } catch (err) {
      setError('Failed to generate redemption token');
      console.error(err);
    }
  };

  // Auto-generate QR on component mount
  useEffect(() => {
    generateQRToken();
  }, [session, clubId, redemptionType]);

  // Regenerate QR if current one is expired
  useEffect(() => {
    const checkExpiration = () => {
      if (expiresAt && new Date() > expiresAt) {
        generateQRToken();
      }
    };

    const intervalId = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
        {error}
        <Button 
          onClick={generateQRToken} 
          variant="outline" 
          className="ml-4 bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 transform hover:scale-105 transition-all duration-300">
      <h2 className="text-xl font-semibold text-white mb-4">
        {redemptionType === 'FREE_DRINK' 
          ? 'Free Drink Redemption' 
          : 'Discount Redemption'}
      </h2>

      {qrData ? (
        <div className="flex flex-col items-center">
          <div className="bg-white/10 p-4 rounded-xl mb-4">
            <QRCode 
              value={qrData} 
              size={256} 
              level={'H'} 
              includeMargin={true} 
              fgColor="#24C6DC"  // Teal color
              bgColor="transparent"
            />
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Valid until: {expiresAt?.toLocaleTimeString()}
          </p>
          <Button 
            onClick={generateQRToken} 
            variant="outline" 
            className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 hover:scale-105 transition-transform"
          >
            Regenerate QR Code
          </Button>
        </div>
      ) : (
        <p className="text-gray-300">Generating QR Code...</p>
      )}
    </div>
  );
}
