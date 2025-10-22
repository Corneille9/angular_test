import {Product} from './product';

export interface CartItem {
  id: number,
  cart_id: number,
  product_id: number,
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  session_id?: number | null;
  items: CartItem[];
}
