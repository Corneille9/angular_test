import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AdminService} from '../../services/admin/admin.service';
import {Payment, PaymentMethod, PaymentStatus} from '../../types';
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
import {debounceAsync} from '@shared/utils/utils';
import {Router} from '@angular/router';

@Component({
  selector: 'app-payments',
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
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class PaymentsComponent implements OnInit {
  private router = inject(Router);


  private adminService = inject(AdminService);
  private alertDialogService = inject(ZardAlertDialogService);

  paginatedPayments = signal<any | null>(null);
  payments = computed(() => this.paginatedPayments()?.data || []);
  isLoading = signal(true);
  errorMessage = signal('');
  currentPage = computed(() => this.paginatedPayments()?.meta?.current_page || 1);
  totalPages = computed(() => this.paginatedPayments()?.meta?.last_page || 1);
  perPage = 15;

  selectedPayment = signal<Payment | null>(null);

  // Filter properties (not signals for ngModel)
  searchQuery = '';
  statusFilter: 'all' | PaymentStatus = 'all';
  methodFilter: 'all' | PaymentMethod = 'all';
  selectedSort = 'default';
  startDate = '';
  endDate = '';

  private debouncedApplyFilters!: () => Promise<void> | void;

  constructor() {
    this.debouncedApplyFilters = debounceAsync(() => this.applyFilters(), 500);
  }

  ngOnInit() {
    this.loadPayments();
  }

  onSearchInput(): void {
    this.debouncedApplyFilters();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as 'all' | PaymentStatus;
    this.applyFilters();
  }

  onMethodChange(value: string): void {
    this.methodFilter = value as 'all' | PaymentMethod;
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

    // Search filter (order_id)
    if (this.searchQuery) {
      params['order_id'] = parseInt(this.searchQuery);
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      params['status'] = this.statusFilter;
    }

    // Payment method filter
    if (this.methodFilter !== 'all') {
      params['payment_method'] = this.methodFilter;
    }

    // Date range filters
    if (this.startDate) {
      params['start_date'] = this.startDate;
    }

    if (this.endDate) {
      params['end_date'] = this.endDate;
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

  loadPayments(page: number = 1) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getPayments(this.buildFilterParams(page)).subscribe({
      next: (response) => {
        this.paginatedPayments.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.errorMessage.set('Failed to load payments. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadPayments(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.methodFilter = 'all';
    this.selectedSort = 'default';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  viewPaymentDetails(payment: Payment) {
    this.selectedPayment.set(payment);
  }

  closeDetails() {
    this.selectedPayment.set(null);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeType(status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getMethodBadgeType(method: PaymentMethod): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (method) {
      case 'stripe':
        return 'default';
      case 'credit_card':
      case 'debit_card':
        return 'secondary';
      case 'paypal':
        return 'outline';
      case 'offline':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  formatPaymentMethod(method: PaymentMethod): string {
    const methodNames: Record<PaymentMethod, string> = {
      'offline': 'Offline',
      'stripe': 'Stripe',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'paypal': 'PayPal'
    };
    return methodNames[method] || method;
  }

  viewOrder(order_id: any) {
    this.router.navigate([`/admin/orders`], {queryParams: {search: order_id}});
  }
}

