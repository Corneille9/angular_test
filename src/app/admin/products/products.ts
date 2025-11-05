import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../../services/product/product.service';
import {PaginatedResponse, Product} from '../../types';
import {AdminLayout} from '../layout/layout';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardAlertDialogService} from '@shared/components/alert-dialog/alert-dialog.service';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardBadgeComponent} from '@shared/components/badge/badge.component';
import {ZardIconComponent} from '@shared/components/icon/icon.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {ZardSelectComponent} from '@shared/components/select/select.component';
import {ZardSelectItemComponent} from '@shared/components/select/select-item.component';
import {ZardTableBodyComponent, ZardTableCellComponent, ZardTableComponent, ZardTableHeadComponent, ZardTableHeaderComponent, ZardTableRowComponent,} from '@shared/components/table/table.component';
import {debounceAsync, getImageUrl} from '@shared/utils/utils';
import {toast} from 'ngx-sonner';
import {SERVER_URL} from '../../config/api';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminLayout,
    ZardLoaderComponent,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
  ],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private alertDialogService = inject(ZardAlertDialogService);

  paginatedProducts = signal<PaginatedResponse<Product> | null>(null);
  products = computed(() => this.paginatedProducts()?.data || []);
  isLoading = signal(true);
  errorMessage = signal('');
  currentPage = computed(() => this.paginatedProducts()?.meta?.current_page || 1);
  totalPages = computed(() => this.paginatedProducts()?.meta?.last_page || 1);
  perPage = 15;

  // Filter properties (not signals for ngModel)
  searchQuery = '';
  selectedCategory = 'all';
  minPrice = '';
  maxPrice = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  stockFilter: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' = 'all';
  selectedSort = 'default';

  // Categories for filter
  categories = signal<any[]>([]);
  isLoadingCategories = signal(false);

  private readonly debouncedApplyFilters!: () => Promise<void> | void;

  constructor() {
    this.debouncedApplyFilters = debounceAsync(() => this.applyFilters(), 500);
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.productService.getCategories({per_page: 100}).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.isLoadingCategories.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories.set(false);
      }
    });
  }

  onSearchInput(): void {
    this.debouncedApplyFilters();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as 'all' | 'active' | 'inactive';
    this.applyFilters();
  }

  onStockChange(value: string): void {
    this.stockFilter = value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
    this.applyFilters();
  }

  onSortChange(value: string): void {
    this.selectedSort = value;
    this.applyFilters();
  }

  buildFilterParams(page: number = 1): Record<string, any> {
    const params: Record<string, any> = {
      per_page: this.perPage,
      page: page,
    };

    // Search filter
    if (this.searchQuery) {
      params['search'] = this.searchQuery;
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      params['category_id'] = parseInt(this.selectedCategory);
    }

    // Price range filters
    if (this.minPrice) {
      params['min_price'] = parseFloat(this.minPrice);
    }

    if (this.maxPrice) {
      params['max_price'] = parseFloat(this.maxPrice);
    }

    // Status filter (is_active)
    if (this.statusFilter !== 'all') {
      params['is_active'] = this.statusFilter === 'active' ? 1 : 0;
    }

    if (this.stockFilter !== 'all') {
      if (this.stockFilter === 'in-stock') {
        params['min_stock'] = 10;
      } else if (this.stockFilter === 'low-stock') {
        params['min_stock'] = 1;
        params['max_stock'] = 9;
      } else if (this.stockFilter === 'out-of-stock') {
        params['max_stock'] = 0;
      }
    }

    // Sort filters
    if (this.selectedSort !== 'default') {
      const [sort_by, sort_order] = this.selectedSort.split('_');
      params['sort_by'] = sort_by;
      params['sort_order'] = sort_order;
    } else {
      params['sort_by'] = 'created_at';
      params['sort_order'] = 'desc';
    }

    return params;
  }

  loadProducts(page: number = 1) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProducts(this.buildFilterParams(page)).subscribe({
      next: (response) => {
        this.paginatedProducts.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set('Failed to load products. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadProducts(1);
  }

  editProduct(product: Product) {
    this.router.navigate(['/admin/products', product.id]);
  }

  deleteProduct(product: Product) {
    this.alertDialogService.confirm({
      zTitle: 'Delete Product',
      zDescription: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => this.performDelete(product)
    });
  }

  private performDelete(product: Product) {
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        // Reload products after deletion
        this.loadProducts(this.currentPage());

        toast.success(`Product "${product.name}" has been deleted successfully.`);
      },
      error: (error: any) => {
        console.error('Error deleting product:', error);

        toast.error(error.error?.message || 'Failed to delete product. Please try again.');
      }
    });
  }

  addNewProduct() {
    this.router.navigate(['/admin/products/new']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getStatusBadgeType(isActive: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    return isActive === 1 ? 'default' : 'secondary';
  }

  getStockBadgeType(stock: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (stock <= 0) return 'destructive';
    if (stock < 10) return 'outline';
    return 'default';
  }

  getStockText(stock: number): string {
    if (stock <= 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.minPrice = '';
    this.maxPrice = '';
    this.statusFilter = 'all';
    this.stockFilter = 'all';
    this.selectedSort = 'default';
    this.applyFilters();
  }

  protected readonly getImageUrl = getImageUrl;
}
