import {Component, computed, inject} from '@angular/core';
import {Layout} from "../layout/layout";
import {CartService} from '../services/cart/cart.service';
import {Router} from '@angular/router';
import {ZardButtonComponent} from '@shared/components/button/button.component';

@Component({
  selector: 'app-checkout',
  imports: [
    Layout,
    ZardButtonComponent
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  private cartService = inject(CartService);
  private router = inject(Router);

  cartItems = this.cartService.cartItems;
  total = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  );

  confirmOrder() {
    alert('Commande confirmée avec succès ✅');
    localStorage.removeItem('cart');
    this.cartService.cart.set(null);
    this.router.navigate(['/']);
  }
}
