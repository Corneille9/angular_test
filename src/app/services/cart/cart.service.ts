import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AddToCartRequest, ApiResponse, ApiResponseWithMessage, Cart, UpdateCartRequest} from '../../types';
import {API_BASE_URL} from '../../config/api';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);

  isLoading = signal(false);
  cart = signal<Cart | null>(null);
  cartItems = computed(() => this.cart()?.items ?? []);
  cartTotal = computed(() => this.cart()?.total ?? 0);
  cartItemsCount = computed(() => this.cart()?.items_count ?? 0);

  constructor() {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.getCart().subscribe({
      next: (response) => {
        if ('data' in response) {
          this.cart.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load cart:', error);
        this.isLoading.set(false);
      }
    });
  }

  getCart(): Observable<ApiResponse<Cart> | { message: string }> {
    return this.http.get<ApiResponse<Cart> | { message: string }>(`${API_BASE_URL}/carts`);
  }

  addToCart(data: AddToCartRequest): Promise<void> {
    this.isLoading.set(true);

    return new Promise((resolve, reject) => {
      this.http.post<ApiResponseWithMessage<Cart>>(`${API_BASE_URL}/carts`, data).subscribe({
        next: (response) => {
          this.cart.set(response.data);
          this.isLoading.set(false);
          resolve();
        },
        error: (error) => {
          this.isLoading.set(false);
          reject(error);
        }
      });
    });
  }

  updateCartItem(data: UpdateCartRequest): Promise<void> {
    this.isLoading.set(true);
    return new Promise((resolve, reject) => {
      this.http.put<ApiResponseWithMessage<Cart>>(`${API_BASE_URL}/carts`, data).subscribe({
        next: (response) => {
          this.cart.set(response.data);
          this.isLoading.set(false);
          resolve();
        },
        error: (error) => {
          this.isLoading.set(false);
          reject(error);
        }
      });
    });
  }

  removeFromCart(productId: number): Promise<boolean> {
    this.isLoading.set(true);
    const params = new HttpParams().set('product_id', productId.toString());
    return new Promise((resolve, reject) => {
      this.http.delete<ApiResponseWithMessage<Cart>>(`${API_BASE_URL}/carts`, {params}).subscribe({
        next: (response) => {
          this.cart.set(response.data);
          this.isLoading.set(false);
          resolve(true);
        },
        error: (error) => {
          this.isLoading.set(false);
          reject(error);
        }
      });
    });
  }

  clearCart(): void {
    this.cart.set(null);
  }
}
