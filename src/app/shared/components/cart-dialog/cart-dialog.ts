import {Component, computed, inject} from '@angular/core';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {CartService} from '../../../services/cart/cart.service';
import {CartItem} from '../../../types/cart';


@Component({
  selector: 'app-cart-dialog',
  imports: [
    ZardButtonComponent
  ],
  templateUrl: './cart-dialog.html',
  styleUrl: './cart-dialog.css'
})
export class CartDialog {
  private cartService = inject(CartService);
  cartItems = this.cartService.cartItems;
  isCartLoading = this.cartService.isLoading;
  total = computed(() => this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0));

  removeItem(item: CartItem) {
    this.cartService.removeProduct(item.product);
  }
}
