import {PaginatedResponse} from './common';

export interface Category {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  category: Category;
}


export type ProductPaginatedResponse = PaginatedResponse<Product>;
