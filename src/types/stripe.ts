export interface Plan {
  id: string;
  name: string;
  setupFee: number;
  monthlyFee: number;
  popular?: boolean;
  features: string[];
  priceId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

export interface StripeError {
  message: string;
}