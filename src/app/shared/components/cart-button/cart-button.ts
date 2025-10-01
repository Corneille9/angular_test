import {Component, computed, inject} from '@angular/core';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardDialogService} from '@shared/components/dialog/dialog.service';
import {CartDialog} from '@shared/components/cart-dialog/cart-dialog';
import {CartService} from '../../../services/cart/cart.service';

interface iDialogData {
  name: string;
  username: string;
}

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [
    ZardButtonComponent
  ],
  templateUrl: './cart-button.html',
  styleUrl: './cart-button.css'
})
export class CartButton {
  private cartService = inject(CartService);
  private dialogService = inject(ZardDialogService);
  cartItems = this.cartService.cartItems;
  cart = this.cartService.cart;
  cartLength = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));

  // private zData: iDialogData = inject(Z_MODAL_DATA);

  openDialog() {
    this.dialogService.create({
      zTitle: 'Cart',
      zDescription: `Your cart. Click checkout to proceed to payment`,
      zContent: CartDialog,
      zData: {} as iDialogData,
      zOkText: 'Checkout',
      zCancelText: 'Close',
      zOnOk: instance => {
      },
      zWidth: '425px',
    });
  }
}
