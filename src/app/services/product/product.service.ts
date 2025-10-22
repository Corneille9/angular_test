import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product, ProductPaginatedResponse} from '../../types/product';
import {CartService} from '../cart/cart.service';
import {API_BASE_URL} from '../../config/api';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private cartService = inject(CartService);

  getProducts(request: Record<string, any> = {}): Observable<ProductPaginatedResponse> {
    const params = new URLSearchParams(request as any).toString();
    return this.http.get<ProductPaginatedResponse>(`${API_BASE_URL}/products?${params}`);
  }

  addToCart(product: Product) {
    return this.cartService.addProduct(product);
  }
}
