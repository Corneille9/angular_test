import {Component, inject} from '@angular/core';
import {Layout} from "../../layout/layout";
import {ZardButtonComponent} from "@shared/components/button/button.component";
import {Router} from '@angular/router';

@Component({
  selector: 'app-cancel',
    imports: [
        Layout,
        ZardButtonComponent
    ],
  templateUrl: './cancel.html',
  styleUrl: './cancel.css'
})
export class CheckoutCancel {
  private router = inject(Router);

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}
