export interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  children?: Category[];
  products_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  is_active: number;
  categories: Category[];
  main_category: Category | null;
  created_at: string | null;
  updated_at: string | null;
}

// Product Request Types
export interface StoreProductRequest {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: File | null;
  category_ids: number[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  image?: File | null;
  category_ids?: number[];
}

// Category Request Types
export interface StoreCategoryRequest {
  name: string;
  description?: string | null;
  parent_id?: number | null;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string | null;
  parent_id?: number | null;
}
