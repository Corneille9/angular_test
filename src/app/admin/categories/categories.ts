import {Component, inject, OnInit, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../../services/product/product.service';
import {Category} from '../../types';
import {AdminLayout} from '../layout/layout';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardAlertDialogService} from '@shared/components/alert-dialog/alert-dialog.service';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardBadgeComponent} from '@shared/components/badge/badge.component';
import {ZardIconComponent} from '@shared/components/icon/icon.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {ZardSelectComponent} from '@shared/components/select/select.component';
import {ZardSelectItemComponent} from '@shared/components/select/select-item.component';
import {
  ZardTableComponent,
  ZardTableHeaderComponent,
  ZardTableBodyComponent,
  ZardTableRowComponent,
  ZardTableHeadComponent,
  ZardTableCellComponent,
} from '@shared/components/table/table.component';
import {debounceAsync} from '@shared/utils/utils';

@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class CategoriesComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private alertDialogService = inject(ZardAlertDialogService);

  paginatedCategories = signal<any | null>(null);
  categories = computed(() => this.paginatedCategories()?.data || []);
  isLoading = signal(true);
  errorMessage = signal('');
  currentPage = computed(() => this.paginatedCategories()?.meta?.current_page || 1);
  totalPages = computed(() => this.paginatedCategories()?.meta?.last_page || 1);
  perPage = 15;

  // Filter properties (not signals for ngModel)
  searchQuery = '';
  selectedSort = 'default';

  private debouncedApplyFilters!: () => Promise<void> | void;

  constructor() {
    this.debouncedApplyFilters = debounceAsync(() => this.applyFilters(), 500);
  }

  ngOnInit() {
    this.loadCategories();
  }

  onSearchInput(): void {
    this.debouncedApplyFilters();
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

  loadCategories(page: number = 1) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getCategories(this.buildFilterParams(page)).subscribe({
      next: (response) => {
        this.paginatedCategories.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage.set('Failed to load categories. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadCategories(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedSort = 'default';
    this.applyFilters();
  }

  addNewCategory() {
    this.router.navigate(['/admin/categories/new']);
  }

  editCategory(category: Category) {
    this.router.navigate(['/admin/categories', category.id]);
  }

  deleteCategory(category: Category) {
    this.alertDialogService.confirm({
      zTitle: 'Delete Category',
      zDescription: `Are you sure you want to delete category "${category.name}"? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zClosable: false,
      zOnOk: () => this.performDelete(category)
    });
  }

  private performDelete(category: Category) {
    this.productService.deleteCategory(category.id).subscribe({
      next: () => {
        // Reload categories after deletion
        this.loadCategories(this.currentPage());

        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: `Category "${category.name}" has been deleted successfully.`,
          zOkText: 'OK',
          zClosable: false,
        });
      },
      error: (error: any) => {
        console.error('Error deleting category:', error);

        this.alertDialogService.warning({
          zTitle: 'Error',
          zDescription: error.error?.message || 'Failed to delete category. Please try again.',
          zOkText: 'OK',
          zClosable: false,
        });
      }
    });
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCategoryParent(category: Category): string {
    return category.parent_id ? `Parent ID: ${category.parent_id}` : 'Root Category';
  }
}
