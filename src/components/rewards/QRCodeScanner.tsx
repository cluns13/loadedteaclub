'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type QRCodeScannerProps = {
  onScan: (data: string) => void;
};

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrCodeRegionRef.current) {
      const config = { fps: 10, qrbox: 250 };

      const html5QrCode = new Html5Qrcode(qrCodeRegionRef.current.id);
      qrCodeScannerRef.current = html5QrCode;

      const startScanning = async () => {
        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              onScan(decodedText);
              stopScanning();
            },
            (errorMessage) => {
              console.warn(`QR Code scanning error: ${errorMessage}`);
            }
          );
          setScanning(true);
        } catch (err) {
          console.error('Error starting QR code scanner:', err);
        }
      };

      const stopScanning = async () => {
        if (html5QrCode && html5QrCode.isScanning) {
          await html5QrCode.stop();
          setScanning(false);
        }
      };

      startScanning();

      return () => {
        stopScanning();
      };
    }
  }, [onScan]);

  return (
    <div className="qr-scanner-container">
      <div 
        ref={qrCodeRegionRef} 
        id="qr-code-scanner-region" 
        className="w-full h-64 bg-gray-100 flex items-center justify-center"
      >
        {!scanning ? (
          <p className="text-gray-500">Initializing scanner...</p>
        ) : (
          <p className="text-gray-500">Scanning QR code...</p>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
