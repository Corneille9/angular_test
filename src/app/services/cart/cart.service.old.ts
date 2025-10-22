// import {computed, Inject, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
// import {HttpClient} from '@angular/common/http';
// import {Cart, CartItem} from '../../types/cart';
// import {Product} from '../../types/product';
// import {isPlatformBrowser} from '@angular/common';
// import {AuthService} from '../auth/auth.service';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class CartService {
//   private http = inject(HttpClient);
//   private authService = inject(AuthService);
//   private base: string = "https://fakestoreapi.com";
//   isLoading = signal(false);
//
//   cart = signal<Cart | null>(null);
//   cartItems = computed(() => this.cart()?.items ?? []);
//
//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {
//     this.loadCart();
//   }
//
//   get(id: string) {
//     return this.http.get<Cart>(`${this.base}/carts/${id}`);
//   }
//
//   all() {
//     return this.http.get<Cart[]>(`${this.base}/carts`);
//   }
//
//   create() {
//     return this.http.post<Cart>(`${this.base}/carts`, {
//       userId: this.authService.user()?.id,
//       items: []
//     });
//   }
//
//   async addProduct(product: Product) {
//     try {
//       this.isLoading.set(true);
//
//       if (!this.cart()) {
//         await this.loadCart(true);
//       }
//       if (!this.cart()) {
//         throw new Error('Cart not found');
//       }
//
//       const cart = this.cart()!;
//
//       const item = cart.items?.find((i) => i.product.id === product.id);
//
//       const items = [
//         ...cart.items.filter((i) => i.product.id !== product.id),
//         {
//           quantity: item ? item.quantity + 1 : 1,
//           product
//         }
//       ];
//
//       this.cart.set({
//         ...cart,
//         // items
//       });
//
//       this.saveCart(this.cart()!);
//
//       return this.http.put<Cart>(`${this.base}/carts/${this.cart()!.id}`, {
//         userId: this.cart()!.user_id,
//         products: items.map((i) => ({
//           productId: i.product.id,
//           quantity: i.quantity
//         }))
//       });
//     } catch (error) {
//       console.error(error);
//       throw error;
//     } finally {
//       this.isLoading.set(false);
//     }
//   }
//
//   removeProduct(item: CartItem) {
//     let cart = this.cart()!;
//     const items = cart.items?.filter((i) => i.product.id !== item.product.id);
//     this.cart.set({
//       ...cart,
//       items
//     });
//
//     this.saveCart(this.cart()!);
//   }
//
//   delete(id: string) {
//     return this.http.delete(`${this.base}/carts/${id}`);
//   }
//
//   saveCart(cart: Cart) {
//     localStorage.setItem('cart', JSON.stringify(cart));
//   }
//
//   async loadCart(create = false) {
//     if (!isPlatformBrowser(this.platformId)) return;
//
//     const data = localStorage.getItem('cart');
//     if (data) {
//       const cart: Cart = JSON.parse(data);
//       this.cart.set(cart);
//       return cart;
//     }
//
//     if (!create) return null;
//
//     return new Promise<Cart>((resolve, reject) => {
//       this.create().subscribe({
//         next: (cart) => {
//           this.saveCart({
//             id: cart.id,
//             user_id: cart.user_id,
//             items: []
//           });
//           this.cart.set({
//             id: cart.id,
//             user_id: cart.user_id,
//             items: []
//           });
//           resolve(this.cart()!);
//         },
//         error: (error) => reject(error)
//       });
//     });
//   }
// }
