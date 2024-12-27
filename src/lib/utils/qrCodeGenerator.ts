import QRCode from 'qrcode';

export class QRCodeGenerator {
  // Generate QR Code for customer ID
  static async generateCustomerIdQR(
    localCustomerId: string, 
    clubId: string
  ): Promise<string> {
    // Generate QR code data
    const qrData = JSON.stringify({
      localCustomerId,
      clubId,
      timestamp: new Date().toISOString()
    });

    // Generate QR code as data URL
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1,
        margin: 2,
        color: {
          dark: '#000',
          light: '#FFF'
        }
      }, (err, url) => {
        if (err) reject(err);
        else resolve(url);
      });
    });
  }

  // Validate QR Code data
  static validateQRData(
    qrData: string, 
    currentClubId: string
  ): boolean {
    try {
      const parsedData = JSON.parse(qrData);
      
      // Check club ID matches
      if (parsedData.clubId !== currentClubId) {
        return false;
      }

      // Optional: Check timestamp to prevent old QR codes
      const qrTimestamp = new Date(parsedData.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - qrTimestamp.getTime()) / (1000 * 3600);

      // QR code valid for 24 hours
      return hoursDiff <= 24;
    } catch {
      return false;
    }
  }
}
