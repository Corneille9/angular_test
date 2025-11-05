// Checkout Item in Summary
export interface CheckoutItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  in_stock: boolean;
  available_stock: number;
}

// Checkout Summary Data
export interface CheckoutSummary {
  items: CheckoutItem[];
  total: number;
}

// Checkout Summary Response
export interface CheckoutSummaryResponse {
  success: boolean;
  data?: CheckoutSummary;
  message?: string;
}

// Process Checkout Request
export interface ProcessCheckoutRequest {
  notes?: string | null;
}

// Process Checkout Data
export interface ProcessCheckoutData {
  order_id: number;
  payment_url: string;
  total: number;
}

// Process Checkout Response
export interface ProcessCheckoutResponse {
  success: boolean;
  message: string;
  data?: ProcessCheckoutData;
}

// Verify Payment Request
export interface VerifyPaymentRequest {
  session_id: string;
}

// Verify Payment Response
export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    order: any;
  };
}

