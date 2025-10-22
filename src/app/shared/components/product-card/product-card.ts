import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {ZardButtonComponent} from "@shared/components/button/button.component";
import {ZardCardComponent} from "@shared/components/card/card.component";
import {Product} from '../../../types/product';
import {CartService} from '../../../services/cart/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [
    ZardButtonComponent,
    ZardCardComponent
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;
  @Output() onAddToCart = new EventEmitter<Product>();
  isCartLoading = inject(CartService).isLoading;

  addToCart() {
    console.log(`${this.product.name} added to cart`);
    this.onAddToCart.emit(this.product);
  }
}
