import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse, ApiResponseWithMessage, CreateUserRequest, DashboardStatistics, Order, OrderStatistics, PaginatedResponse, Payment, PaymentStatistics, StorePaymentRequest, UpdateOrderRequest, UpdateUserRequest, User} from '../../types';
import {API_BASE_URL} from '../../config/api';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  isLoading = signal(false);

  // Dashboard Methods
  getDashboardStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(`${API_BASE_URL}/admin/dashboard`);
  }

  getSalesChartData(period: string = 'week'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any>(`${API_BASE_URL}/admin/dashboard/sales-chart`, {params});
  }

  // Order Management Methods
  getOrders(params?: {
    per_page?: number;
    status?: string;
    user_id?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<PaginatedResponse<Order>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Order>>(`${API_BASE_URL}/admin/orders`, {params: httpParams});
  }

  getOrderStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${API_BASE_URL}/admin/orders/statistics`);
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${API_BASE_URL}/admin/orders/${id}`);
  }

  updateOrder(id: number, data: UpdateOrderRequest): Observable<ApiResponseWithMessage<Order>> {
    return this.http.put<ApiResponseWithMessage<Order>>(`${API_BASE_URL}/admin/orders/${id}`, data);
  }

  deleteOrder(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/admin/orders/${id}`);
  }

  // Payment Management Methods
  getPayments(params?: {
    per_page?: number;
    status?: string;
    payment_method?: string;
    order_id?: number;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<PaginatedResponse<Payment>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Payment>>(`${API_BASE_URL}/admin/payments`, {params: httpParams});
  }

  getPaymentStatistics(): Observable<PaymentStatistics> {
    return this.http.get<PaymentStatistics>(`${API_BASE_URL}/admin/payments/statistics`);
  }

  getPayment(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${API_BASE_URL}/admin/payments/${id}`);
  }

  createPayment(data: StorePaymentRequest): Observable<ApiResponseWithMessage<Payment>> {
    return this.http.post<ApiResponseWithMessage<Payment>>(`${API_BASE_URL}/admin/payments`, data);
  }

  // User Management Methods
  getUsers(params?: {
    per_page?: number;
    search?: string;
    role?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<User>>(`${API_BASE_URL}/admin/users`, {params: httpParams});
  }

  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${API_BASE_URL}/admin/users/${id}`);
  }

  createUser(data: CreateUserRequest): Observable<ApiResponseWithMessage<User>> {
    return this.http.post<ApiResponseWithMessage<User>>(`${API_BASE_URL}/admin/users`, data);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<ApiResponseWithMessage<User>> {
    return this.http.put<ApiResponseWithMessage<User>>(`${API_BASE_URL}/admin/users/${id}`, data);
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/admin/users/${id}`);
  }
}
