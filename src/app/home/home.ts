import {Component, computed, signal} from '@angular/core';
import {Layout} from '../layout/layout';
import {Category, PaginatedResponse, Product} from '../types';
import {ProductCard} from '@shared/components/product-card/product-card';
import {ProductService} from '../services/product/product.service';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardPaginationButtonComponent, ZardPaginationContentComponent, ZardPaginationEllipsisComponent, ZardPaginationItemComponent, ZardPaginationNextComponent, ZardPaginationPreviousComponent} from '@shared/components/pagination/pagination.component';
import {CartService} from '../services/cart/cart.service';
import {toast} from 'ngx-sonner';
import {ZardSelectComponent} from '@shared/components/select/select.component';
import {ZardSelectItemComponent} from '@shared/components/select/select-item.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {FormsModule} from '@angular/forms';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {debounceAsync} from '@shared/utils/utils';

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
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardInputDirective,
    FormsModule,
    ZardButtonComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  paginatedProducts = signal<PaginatedResponse<Product> | null>(null);
  currentPage = computed(() => this.paginatedProducts()?.meta?.current_page || 1);
  totalPages = computed(() => (this.paginatedProducts()?.meta?.total || 0) / (this.paginatedProducts()?.meta.per_page || 0));

  products = computed(() => this.paginatedProducts()?.data || []);
  isEmpty = computed(() => this.products().length === 0);
  pages = computed<number[]>(() => Array.from({length: this.totalPages()}, (_, i) => i + 1));

  isLoading = signal(false);
  categories = signal<Category[]>([]);
  isLoadingCategories = signal(false);

  private debouncedApplyFilters!: () => Promise<void> | void;

  // Filter properties (not signals for ngModel)
  searchQuery = '';
  selectedCategory = 'all';
  minPrice = '';
  maxPrice = '';
  selectedSort = 'default';
  inStockOnly = false;


  constructor(private productService: ProductService, private cartService: CartService) {
    this.debouncedApplyFilters = debounceAsync(() => this.applyFilters(), 500);
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.loadCategories();
    this.fetchProducts(this.buildFilterParams());
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.productService.getCategories({per_page: 100}).subscribe({
      next: (response: PaginatedResponse<Category>) => {
        this.categories.set(response.data);
        this.isLoadingCategories.set(false);
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories.set(false);
      }
    });
  }

  buildFilterParams(): Record<string, any> {
    const params: Record<string, any> = {
      per_page: 6,
      page: this.currentPage(),
    };

    if (this.searchQuery) {
      params['search'] = this.searchQuery;
    }

    if (this.selectedCategory !== 'all') {
      params['category_id'] = parseInt(this.selectedCategory);
    }

    if (this.minPrice) {
      params['min_price'] = parseFloat(this.minPrice);
    }

    if (this.maxPrice) {
      params['max_price'] = parseFloat(this.maxPrice);
    }

    if (this.inStockOnly) {
      params['in_stock'] = true;
    }

    if (this.selectedSort !== 'default') {
      const [sort_by, sort_order] = this.selectedSort.split('_');
      params['sort_by'] = sort_by;
      params['sort_order'] = sort_order;
    }

    return params;
  }

  applyFilters(): void {
    this.fetchProducts(this.buildFilterParams());
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.selectedSort = '';
    this.inStockOnly = false;
    this.applyFilters();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.applyFilters();
  }

  onSortChange(value: string): void {
    this.selectedSort = value;
    this.applyFilters();
  }

  onSearchInput(): void {
    this.debouncedApplyFilters();
  }

  fetchProducts(request: Record<string, any> = {}) {
    this.isLoading.set(true);
    this.productService.getProducts(request).subscribe({
      next: (paginatedProducts: PaginatedResponse<Product>) => {
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
    const params = this.buildFilterParams();
    params['page'] = page;
    this.fetchProducts(params);
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
    try {
      await this.cartService.addToCart({
        product_id: product.id,
        quantity: 1
      });

      toast.success('Product added to cart', {
        description: 'The product has been added to your cart.',
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to add to cart', {
        description: 'An error occurred while adding the product to the cart.',
      });
    }
  }
}

