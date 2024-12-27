// Generates a short, memorable customer ID for Loaded Tea Clubs
export function generateCustomerId(clubId: string): string {
  // Combination of:
  // 1. Short prefix from club name
  // 2. Random alphanumeric code
  // 3. Short checksum

  // Extract 2-3 letter prefix from club name
  const prefix = clubId
    .replace(/[^A-Z]/g, '')
    .substring(0, 3)
    .toUpperCase();

  // Generate random 4-character code
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  // Simple checksum
  const checksum = (
    prefix.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 10
  ).toString();

  return `${prefix}${randomPart}${checksum}`;
}

// Validates a customer ID for Loaded Tea Clubs
export function validateCustomerId(
  customerId: string, 
  clubId: string
): boolean {
  if (customerId.length !== 8) return false;

  const prefix = customerId.substring(0, 3);
  const randomPart = customerId.substring(3, 7);
  const checksum = customerId.substring(7);

  // Check prefix matches club
  const expectedPrefix = clubId
    .replace(/[^A-Z]/g, '')
    .substring(0, 3)
    .toUpperCase();

  if (prefix !== expectedPrefix) return false;

  // Validate checksum
  const calculatedChecksum = (
    prefix.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 10
  ).toString();

  return checksum === calculatedChecksum;
}
