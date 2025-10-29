import { Order } from './order';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'offline' | 'stripe' | 'credit_card' | 'debit_card' | 'paypal';

export interface Payment {
  id: number;
  order_id: number;
  order?: Order;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  created_at: string | null;
  updated_at: string | null;
}

// Payment Request Types
export interface StorePaymentRequest {
  order_id: number;
  amount: number;
  payment_method: PaymentMethod;
}

// Payment Statistics
export interface PaymentStatistics {
  total_payments: number;
  pending_payments: number;
  completed_payments: number;
  failed_payments: number;
  total_amount: number;
  today_payments: number;
  today_amount: number;
}

