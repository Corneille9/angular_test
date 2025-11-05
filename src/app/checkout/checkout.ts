import {Component, inject, signal} from '@angular/core';
import {Layout} from "../layout/layout";
import {CartService} from '../services/cart/cart.service';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {CheckoutService} from '../services/checkout/checkout.service';
import {toast} from 'ngx-sonner';
import {FormsModule} from '@angular/forms';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {getImageUrl} from '@shared/utils/utils';

@Component({
  selector: 'app-checkout',
  imports: [
    Layout,
    ZardButtonComponent,
    FormsModule,
    ZardInputDirective
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);

  cartItems = this.cartService.cartItems;
  total = this.cartService.cartTotal;
  isProcessing = signal(false);

  // Form fields
  notes = '';

  async confirmOrder() {
    if (this.cartItems().length === 0) {
      toast.error('Your cart is empty', {
        description: 'Please add items to your cart before checking out.',
        position: 'top-right',
      });
      return;
    }

    this.isProcessing.set(true);

    try {
      const response = await this.checkoutService.processCheckout({
        notes: this.notes || null
      }).toPromise();

      if (response?.success && response.data?.payment_url) {
        // Redirect to Stripe payment page
        window.location.href = response.data.payment_url;
      } else {
        toast.error('Checkout failed', {
          description: response?.message || 'Unable to process checkout',
          position: 'top-right',
        });
        this.isProcessing.set(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed', {
        description: error.error?.message || 'An error occurred during checkout',
        position: 'top-right',
      });
      this.isProcessing.set(false);
    }
  }

  protected readonly getImageUrl = getImageUrl;
}
