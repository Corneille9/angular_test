import {Component, signal} from '@angular/core';
import {Layout} from '../layout/layout';
import {Product} from '../types/product';
import {ProductCard} from '@shared/components/product-card/product-card';
import {ProductService} from '../services/product/product.service';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';


@Component({
  selector: 'app-home',
  imports: [
    Layout,
    ProductCard,
    ZardLoaderComponent,

  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  products: Product[] = [];
  isLoading = signal(false);

  constructor(private productService: ProductService) {

  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
      },
      error: (error: any) => {
        console.error(error);
      },
      complete: () => {
        this.isLoading.set(false);
        console.log('Products loaded');
      }
    });
  }

  async handleAddToCart(product: Product) {
    console.log("Add to cart..")
    await this.productService.addToCart(product);
  }
}
