import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse, ApiResponseWithMessage, Category, PaginatedResponse, Product, StoreCategoryRequest, StoreProductRequest, UpdateCategoryRequest, UpdateProductRequest} from '../../types';
import {API_BASE_URL} from '../../config/api';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  isLoading = signal(false);

  // Product Methods
  getProducts(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    min_stock?: number;
    max_stock?: number;
    in_stock?: boolean;
    is_active?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Product>>(`${API_BASE_URL}/products`, {params: httpParams});
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${API_BASE_URL}/products/${id}`);
  }

  createProduct(data: StoreProductRequest): Observable<ApiResponseWithMessage<Product>> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'category_ids' && Array.isArray(value)) {
          value.forEach((id, index) => {
            formData.append(`category_ids[${index}]`, id.toString());
          });
        } else if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return this.http.post<ApiResponseWithMessage<Product>>(`${API_BASE_URL}/admin/products`, formData);
  }

  updateProduct(id: number, data: UpdateProductRequest): Observable<ApiResponseWithMessage<Product>> {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'category_ids' && Array.isArray(value)) {
          value.forEach((id, index) => {
            formData.append(`category_ids[${index}]`, id.toString());
          });
        } else if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return this.http.post<ApiResponseWithMessage<Product>>(`${API_BASE_URL}/admin/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/admin/products/${id}`);
  }

  // Category Methods
  getCategories(params?: { per_page?: number, search?: string, sort_by?: string, sort_order?: 'asc' | 'desc', page?: number }): Observable<PaginatedResponse<Category>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Category>>(`${API_BASE_URL}/categories`, {params: httpParams});
  }

  getCategory(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${API_BASE_URL}/categories/${id}`);
  }

  createCategory(data: StoreCategoryRequest): Observable<ApiResponseWithMessage<Category>> {
    return this.http.post<ApiResponseWithMessage<Category>>(`${API_BASE_URL}/admin/categories`, data);
  }

  updateCategory(id: number, data: UpdateCategoryRequest): Observable<ApiResponseWithMessage<Category>> {
    return this.http.put<ApiResponseWithMessage<Category>>(`${API_BASE_URL}/admin/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/admin/categories/${id}`);
  }
}
