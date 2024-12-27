import { Client, Environment, ApiError } from 'square';
import { Order } from './orderService';

export class PaymentService {
  private client: Client;

  constructor(accessToken?: string) {
    this.client = new Client({
      environment: process.env.NODE_ENV === 'production' 
        ? Environment.Production 
        : Environment.Sandbox,
      accessToken: accessToken || process.env.SQUARE_ACCESS_TOKEN
    });
  }

  async processPayment(
    order: Order, 
    paymentSourceId: string
  ) {
    try {
      const response = await this.client.paymentsApi.createPayment({
        sourceId: paymentSourceId,
        idempotencyKey: order.id,
        amountMoney: {
          amount: Math.round(order.totalAmount * 100), // Convert to cents
          currency: 'USD'
        },
        autocomplete: true,
        locationId: order.clubId // Use club ID as location
      });

      return {
        paymentId: response.result.payment.id,
        status: response.result.payment.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Square Payment Error:', error.errors);
      }
      throw error;
    }
  }

  async refundPayment(
    paymentId: string, 
    amount: number
  ) {
    try {
      const response = await this.client.refundsApi.refundPayment({
        idempotencyKey: `REFUND_${Date.now()}`,
        paymentId: paymentId,
        amountMoney: {
          amount: Math.round(amount * 100),
          currency: 'USD'
        }
      });

      return {
        refundId: response.result.refund.id,
        status: response.result.refund.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Square Refund Error:', error.errors);
      }
      throw error;
    }
  }

  async createPaymentLink(
    order: Order
  ) {
    try {
      const response = await this.client.checkoutApi.createPaymentLink({
        quickPay: {
          name: `Order for ${order.id}`,
          priceMoney: {
            amount: Math.round(order.totalAmount * 100),
            currency: 'USD'
          },
          locationId: order.clubId
        },
        checkoutOptions: {
          allowTipping: true
        }
      });

      return {
        paymentLinkUrl: response.result.paymentLink.url,
        paymentLinkId: response.result.paymentLink.id
      };
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Square Payment Link Error:', error.errors);
      }
      throw error;
    }
  }
}
