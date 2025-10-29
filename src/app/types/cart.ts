import { Product } from './product';

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  subtotal: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Cart {
  id: number;
  user_id: number | null;
  items: CartItem[];
  items_count: number;
  total: number;
  created_at: string | null;
  updated_at: string | null;
}

// Cart Request Types
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartRequest {
  product_id: number;
  quantity: number;
}
