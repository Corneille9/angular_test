import { Product } from './product';
import { User } from './user';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  user?: User;
  total: number;
  status: OrderStatus | string;
  items?: OrderItem[];
  items_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

// Order Request Types
export interface UpdateOrderRequest {
  status: OrderStatus | string;
}

// Order Statistics
export interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
}

