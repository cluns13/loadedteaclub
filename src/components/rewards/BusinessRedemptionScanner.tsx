'use client';

import { useState } from 'react';
import QrReader from 'react-qr-reader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { trackCustomerPurchase, redeemReward } from '@/lib/services/rewardsService';

interface BusinessRedemptionScannerProps {
  clubId: string;
}

export function BusinessRedemptionScanner({ clubId }: BusinessRedemptionScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');

  const handleScan = async (data: string | null) => {
    if (data) {
      try {
        // Assuming QR code contains customer ID
        const customerId = data;
        const purchaseResult = await trackCustomerPurchase(clubId, customerId);

        if (purchaseResult.isEligibleForReward) {
          toast.success(`Customer is eligible for a free drink! ${purchaseResult.currentPurchaseCount}/${purchaseResult.rewardThreshold} purchases`);
        } else {
          toast.info(`Current progress: ${purchaseResult.currentPurchaseCount}/${purchaseResult.rewardThreshold} purchases`);
        }
      } catch (error) {
        toast.error('Error processing purchase');
      }
    }
  };

  const handleRedemption = async () => {
    try {
      const result = await redeemReward(clubId, manualCode);
      if (result.rewardRedeemed) {
        toast.success('Reward successfully redeemed!');
        setManualCode('');
      }
    } catch (error) {
      toast.error('Unable to redeem reward');
    }
  };

  const handleError = (err: Error) => {
    console.error(err);
    toast.error('QR Code scanning error');
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h3 className="text-xl font-semibold mb-4 text-white">
        Rewards Redemption
      </h3>

      <div className="flex mb-4 space-x-2">
        <Button 
          onClick={() => setScanMode('qr')}
          className={`w-1/2 ${scanMode === 'qr' ? 'bg-teal-500/30' : 'bg-white/10'}`}
        >
          QR Scan
        </Button>
        <Button 
          onClick={() => setScanMode('manual')}
          className={`w-1/2 ${scanMode === 'manual' ? 'bg-teal-500/30' : 'bg-white/10'}`}
        >
          Manual Entry
        </Button>
      </div>

      {scanMode === 'qr' ? (
        <div className="mb-4">
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Input 
            placeholder="Enter Customer ID"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="bg-white/10 text-white border-white/20"
          />
          <Button 
            onClick={handleRedemption}
            className="w-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
            disabled={!manualCode}
          >
            Redeem Reward
          </Button>
        </div>
      )}

      <p className="text-sm text-gray-400 mt-4">
        Scan QR or enter customer ID to track or redeem rewards
      </p>
    </div>
  );
}
