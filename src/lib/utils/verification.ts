import crypto from 'crypto';

export function generateVerificationCode(length: number = 6): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function validateBusinessEmail(email: string): boolean {
  // Check if it's a free email provider
  const freeEmailProviders = [
    '@gmail.com',
    '@yahoo.com',
    '@hotmail.com',
    '@outlook.com',
    '@aol.com',
    '@icloud.com',
    '@mail.com'
  ];

  return !freeEmailProviders.some(provider => email.toLowerCase().endsWith(provider));
}

export function validateDocument(fileType: string, maxSizeMB: number = 10): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/heic'
  ];

  return allowedTypes.includes(fileType);
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic US phone number validation
  const phoneRegex = /^\+?1?\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function validateBusinessLicense(license: string): boolean {
  // Implement business license format validation based on your requirements
  // This is a placeholder implementation
  return license.length > 0;
}

export function validateAddress(address: string): boolean {
  // Basic US address validation
  const addressRegex = /^\d+\s+[A-Za-z0-9\s,.-]+$/;
  return addressRegex.test(address);
}
