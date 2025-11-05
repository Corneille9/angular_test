import {Component, computed, inject} from '@angular/core';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {CartService} from '../../../services/cart/cart.service';
import {CartItem} from '../../../types';
import {getImageUrl} from '@shared/utils/utils';


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
  total = computed(() => this.cartItems().reduce((total, item) => total + item.subtotal, 0));

  async incrementQuantity(item: CartItem) {
    await this.cartService.updateCartItem({
      product_id: item.product_id,
      quantity: item.quantity + 1
    });
  }

  async decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      await this.cartService.updateCartItem({
        product_id: item.product_id,
        quantity: item.quantity - 1
      });
    }
  }

  async removeItem(item: CartItem) {
    const cartId = this.cartService.cart()?.id;
    if (cartId) {
      await this.cartService.removeFromCart( item.product_id);
    }
  }

  protected readonly getImageUrl = getImageUrl;
}
