import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

export class SquareService {
  private client: Client;

  constructor() {
    this.client = new Client({
      environment: process.env.NODE_ENV === 'production' 
        ? Environment.Production 
        : Environment.Sandbox,
      accessToken: process.env.SQUARE_ACCESS_TOKEN
    });
  }

  // Generate OAuth Authorization URL
  generateAuthorizationUrl(clubId: string): string {
    const state = randomUUID(); // CSRF protection
    const scopes = [
      'MERCHANT_PROFILE_READ',
      'ORDERS_READ',
      'ORDERS_WRITE',
      'PAYMENTS_READ',
      'PAYMENTS_WRITE'
    ];

    return `https://connect.squareup.com/oauth2/authorize?client_id=${process.env.SQUARE_CLIENT_ID}&state=${state}&response_type=code&scope=${scopes.join('+')}`;
  }

  // Exchange Authorization Code for Access Token
  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    merchantId: string;
  }> {
    try {
      const response = await this.client.oAuthApi.obtainToken({
        clientId: process.env.SQUARE_CLIENT_ID,
        clientSecret: process.env.SQUARE_CLIENT_SECRET,
        code,
        grantType: 'authorization_code'
      });

      return {
        accessToken: response.result.accessToken,
        refreshToken: response.result.refreshToken,
        merchantId: response.result.merchantId
      };
    } catch (error) {
      console.error('Square OAuth Token Exchange Failed', error);
      throw error;
    }
  }

  // Refresh Access Token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await this.client.oAuthApi.obtainToken({
        clientId: process.env.SQUARE_CLIENT_ID,
        clientSecret: process.env.SQUARE_CLIENT_SECRET,
        grantType: 'refresh_token',
        refreshToken
      });

      return response.result.accessToken;
    } catch (error) {
      console.error('Square Token Refresh Failed', error);
      throw error;
    }
  }

  // Retrieve Merchant Profile
  async getMerchantProfile(accessToken: string) {
    const client = new Client({
      environment: process.env.NODE_ENV === 'production' 
        ? Environment.Production 
        : Environment.Sandbox,
      accessToken
    });

    try {
      const response = await client.merchantsApi.listMerchants();
      return response.result.merchant;
    } catch (error) {
      console.error('Failed to retrieve merchant profile', error);
      throw error;
    }
  }
}
