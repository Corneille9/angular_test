export interface CheckoutItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  in_stock: boolean;
  available_stock: number;
}

export interface CheckoutSummary {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

// Checkout Request Types
export interface CheckoutSummaryRequest {
  cart_id: number;
}

export interface ProcessCheckoutRequest {
  cart_id: number;
  payment_method: 'offline' | 'stripe';
  shipping_address_id: number;
  billing_address_id?: number | null;
  payment_method_id?: string;
  notes?: string | null;
}

export interface ConfirmPaymentRequest {
  order_id: number;
  payment_intent_id: string;
}

// Checkout Response Types
export interface CheckoutSummaryResponse {
  success: boolean;
  data?: CheckoutSummary;
  message?: string;
  errors?: any;
}

export interface ProcessCheckoutResponse {
  success: boolean;
  message: string;
  data?: {
    order: any;
    payment: any;
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  data?: any;
}

