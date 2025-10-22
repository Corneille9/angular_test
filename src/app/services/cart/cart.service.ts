import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Cart} from '../../types/cart';
import {Product} from '../../types/product';
import {AuthService} from '../auth/auth.service';
import {API_BASE_URL} from '../../config/api';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  isLoading = signal(false);

  cart = signal<Cart | null>(null);
  cartItems = computed(() => this.cart()?.items ?? []);

  constructor() {
    this.loadCart();
  }


  async addProduct(product: Product) {
    this.isLoading.set(true);

    this.http.post<{data: Cart}>(`${API_BASE_URL}/carts`, {
      product_id: product.id,
      quantity: 1
    }).subscribe({
      next: (response) => {
        this.cart.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  removeProduct(product: Product) {
    if (!this.cart()) return;

    this.http.delete<{ data: Cart }>(`${API_BASE_URL}/carts/${this.cart()?.id}?product_id=${product.id}`,).subscribe({
      next: (response) => {
        this.cart.set(response.data);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  loadCart() {
    console.log("Load cart...")
    this.isLoading.set(true);

    this.http.get<Cart>(`${API_BASE_URL}/carts`).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      }
    });

  }
}
