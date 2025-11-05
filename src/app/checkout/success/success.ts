import {Component, inject, OnInit, signal} from '@angular/core';
import {Layout} from "../../layout/layout";
import {ZardButtonComponent} from "@shared/components/button/button.component";
import {ZardLoaderComponent} from "@shared/components/loader/loader.component";
import {ActivatedRoute, Router} from '@angular/router';
import {CheckoutService} from '../../services/checkout/checkout.service';
import {CartService} from '../../services/cart/cart.service';
import {toast} from 'ngx-sonner';

@Component({
  selector: 'app-success',
  imports: [
    Layout,
    ZardButtonComponent,
    ZardLoaderComponent
  ],
  templateUrl: './success.html',
  styleUrl: './success.css'
})
export class CheckoutSuccess implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);

  isVerifying = signal(true);
  isSuccess = signal(false);
  orderId = signal<number | null>(null);
  errorMessage = signal<string>('');

  ngOnInit() {
    this.checkPayment()
  }

  async checkPayment() {
    this.isVerifying.set(true)
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.isVerifying.set(false);
      this.errorMessage.set('No session ID provided');
      return;
    }

    await this.verifyPayment(sessionId);
  }

  async verifyPayment(sessionId: string) {
    try {
      const response = await this.checkoutService.verifyPayment({session_id: sessionId}).toPromise();

      if (response?.success) {
        this.isSuccess.set(true);
        this.orderId.set(response.data?.order?.id || null);

        // Clear cart after successful payment
        // this.cartService.clearCart();

        toast.success('Payment verified successfully', {
          description: 'Your order has been confirmed.',
          position: 'top-right',
        });
      } else {
        this.isSuccess.set(false);
        this.errorMessage.set(response?.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      this.isSuccess.set(false);
      this.errorMessage.set(error.error?.message || 'An error occurred while verifying payment');

      toast.error('Payment verification failed', {
        description: error.error?.message || 'Please contact support',
        position: 'top-right',
      });
    } finally {
      this.isVerifying.set(false);
    }
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}
