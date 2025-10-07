import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../types/product';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

export interface Order {
  id: number;
  userId: number;
  date: string;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private base = 'https://fakestoreapi.com';

  isLoading = signal(false);

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, product);
  }

  updateProduct(id: any, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${id}`, product);
  }

  deleteProduct(id: any): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  // Orders Management
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/carts`);
  }

  getOrder(id: any): Observable<Order> {
    return this.http.get<Order>(`${this.base}/carts/${id}`);
  }

  updateOrderStatus(id: any, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/carts/${id}`, { status });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return new Observable(observer => {
      Promise.all([
        this.http.get<Product[]>(`${this.base}/products`).toPromise(),
        this.http.get<Order[]>(`${this.base}/carts`).toPromise(),
        this.http.get<any[]>(`${this.base}/users`).toPromise()
      ]).then(([products, orders, users]) => {
        const stats: DashboardStats = {
          totalProducts: products?.length || 0,
          totalOrders: orders?.length || 0,
          totalRevenue: orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0,
          totalUsers: users?.length || 0
        };
        observer.next(stats);
        observer.complete();
      }).catch(error => observer.error(error));
    });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/products/categories`);
  }
}
