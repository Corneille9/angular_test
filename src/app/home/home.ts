import {Component, computed, signal, WritableSignal} from '@angular/core';
import {Layout} from '../layout/layout';
import {Product, ProductPaginatedResponse} from '../types/product';
import {ProductCard} from '@shared/components/product-card/product-card';
import {ProductService} from '../services/product/product.service';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardPaginationButtonComponent, ZardPaginationContentComponent, ZardPaginationEllipsisComponent, ZardPaginationItemComponent, ZardPaginationNextComponent, ZardPaginationPreviousComponent} from '@shared/components/pagination/pagination.component';


@Component({
  selector: 'app-home',
  imports: [
    Layout,
    ProductCard,
    ZardLoaderComponent,
    ZardPaginationContentComponent,
    ZardPaginationItemComponent,
    ZardPaginationPreviousComponent,
    ZardPaginationButtonComponent,
    ZardPaginationNextComponent,
    ZardPaginationEllipsisComponent,

  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  paginatedProducts: WritableSignal<ProductPaginatedResponse | null> = signal(null);
  currentPage = computed(() => this.paginatedProducts()?.current_page || 1);
  totalPages = computed(() => (this.paginatedProducts()?.total || 0) / (this.paginatedProducts()?.per_page || 0));

  products = computed(() => this.paginatedProducts()?.data || []);
  isEmpty = computed(() => this.products().length === 0);
  pages = computed<number[]>(() => Array.from({length: this.totalPages()}, (_, i) => i + 1));

  isLoading = signal(false);

  filters = signal({
    search: '',
    category: '',
    price: '',
    rating: '',
    sort: '',
    page: 1,
    per_page: 6
  });

  constructor(private productService: ProductService) {

  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.fetchProducts(this.filters())
  }

  fetchProducts(request: Record<string, any> = {}) {
    this.isLoading.set(true);
    this.productService.getProducts(request).subscribe({
      next: (paginatedProducts: ProductPaginatedResponse) => {
        this.paginatedProducts.set(paginatedProducts);
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

  goToPage(page: number) {
    this.fetchProducts({
      ...this.filters(),
      page,
    })
  }

  goToPrevious() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  goToNext() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  async handleAddToCart(product: Product) {
    console.log("Add to cart..")
    await this.productService.addToCart(product);
  }
}
