import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AdminService} from '../../services/admin/admin.service';
import {Order, OrderStatus} from '../../types';
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
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-orders',
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
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  private adminService = inject(AdminService);
  private alertDialogService = inject(ZardAlertDialogService);
  private route = inject(ActivatedRoute);

  paginatedOrders = signal<any | null>(null);
  orders = computed(() => this.paginatedOrders()?.data || []);
  isLoading = signal(true);
  errorMessage = signal('');
  currentPage = computed(() => this.paginatedOrders()?.meta?.current_page || 1);
  totalPages = computed(() => this.paginatedOrders()?.meta?.last_page || 1);
  perPage = 15;

  selectedOrder = signal<Order | null>(null);

  // Filter properties (not signals for ngModel)
  searchQuery = '';
  statusFilter: 'all' | OrderStatus = 'all';
  selectedSort = 'default';
  startDate = '';
  endDate = '';

  private readonly debouncedApplyFilters!: () => Promise<void> | void;

  constructor() {
    this.debouncedApplyFilters = debounceAsync(() => this.applyFilters(), 500);
  }

  ngOnInit() {
    this.searchQuery = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadOrders();
  }

  onSearchInput(): void {
    this.debouncedApplyFilters();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as 'all' | OrderStatus;
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

    // Status filter
    if (this.statusFilter !== 'all') {
      params['status'] = this.statusFilter;
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

  loadOrders(page: number = 1) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getOrders(this.buildFilterParams(page)).subscribe({
      next: (response) => {
        this.paginatedOrders.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadOrders(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.selectedSort = 'default';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder.set(order);
  }

  closeDetails() {
    this.selectedOrder.set(null);
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus | string) {
    this.alertDialogService.confirm({
      zTitle: 'Update Order Status',
      zDescription: `Are you sure you want to change the order status to "${newStatus}"?`,
      zOkText: 'Update',
      zCancelText: 'Cancel',
      zOnOk: () => this.performStatusUpdate(order, newStatus)
    });
  }

  private performStatusUpdate(order: Order, newStatus: OrderStatus | string) {
    this.adminService.updateOrder(order.id, {status: newStatus}).subscribe({
      next: () => {
        // Reload orders after update
        this.loadOrders(this.currentPage());

        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: `Order #${order.id} status has been updated to ${newStatus}.`,
          zOkText: 'OK'
        });
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);

        this.alertDialogService.warning({
          zTitle: 'Error',
          zDescription: error.error?.message || 'Failed to update order status. Please try again.',
          zOkText: 'OK'
        });
      }
    });
  }

  deleteOrder(order: Order) {
    this.alertDialogService.confirm({
      zTitle: 'Delete Order',
      zDescription: `Are you sure you want to delete order #${order.id}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => this.performDelete(order)
    });
  }

  private performDelete(order: Order) {
    this.adminService.deleteOrder(order.id).subscribe({
      next: () => {
        // Reload orders after deletion
        this.loadOrders(this.currentPage());

        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: `Order #${order.id} has been deleted successfully.`,
          zOkText: 'OK'
        });
      },
      error: (error: any) => {
        console.error('Error deleting order:', error);

        this.alertDialogService.warning({
          zTitle: 'Error',
          zDescription: error.error?.message || 'Failed to delete order. Please try again.',
          zOkText: 'OK'
        });
      }
    });
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

  getStatusBadgeType(status: OrderStatus | string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'completed':
        return 'default';
      case 'paid':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  }
}
