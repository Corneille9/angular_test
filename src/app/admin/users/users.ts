import {Component, inject, OnInit, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AdminService} from '../../services/admin/admin.service';
import {User, UserRole} from '../../types';
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
  selector: 'app-users',
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
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private alertDialogService = inject(ZardAlertDialogService);

  paginatedUsers = signal<any | null>(null);
  users = computed(() => this.paginatedUsers()?.data || []);
  isLoading = signal(true);
  errorMessage = signal('');
  currentPage = computed(() => this.paginatedUsers()?.meta?.current_page || 1);
  totalPages = computed(() => this.paginatedUsers()?.meta?.last_page || 1);
  perPage = 15;

  // Filter properties (not signals for ngModel)
  searchQuery = '';
  roleFilter: 'all' | UserRole = 'all';
  selectedSort = 'default';

  private debouncedApplyFilters!: () => Promise<void> | void;

  constructor() {
    this.debouncedApplyFilters = debounceAsync(() => this.applyFilters(), 500);
  }

  ngOnInit() {
    this.loadUsers();
  }

  onSearchInput(): void {
    this.debouncedApplyFilters();
  }

  onRoleChange(value: string): void {
    this.roleFilter = value as 'all' | UserRole;
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

    // Role filter
    if (this.roleFilter !== 'all') {
      params['role'] = this.roleFilter;
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

  loadUsers(page: number = 1) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getUsers(this.buildFilterParams(page)).subscribe({
      next: (response) => {
        this.paginatedUsers.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage.set('Failed to load users. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadUsers(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.roleFilter = 'all';
    this.selectedSort = 'default';
    this.applyFilters();
  }

  addNewUser() {
    this.router.navigate(['/admin/users/new']);
  }

  editUser(user: User) {
    this.router.navigate(['/admin/users', user.id]);
  }

  deleteUser(user: User) {
    this.alertDialogService.confirm({
      zTitle: 'Delete User',
      zDescription: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => this.performDelete(user)
    });
  }

  private performDelete(user: User) {
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        // Reload users after deletion
        this.loadUsers(this.currentPage());

        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: `User "${user.name}" has been deleted successfully.`,
          zOkText: 'OK'
        });
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);

        this.alertDialogService.warning({
          zTitle: 'Error',
          zDescription: error.error?.message || 'Failed to delete user. Please try again.',
          zOkText: 'OK'
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

  getRoleBadgeType(role: UserRole): 'default' | 'secondary' | 'destructive' | 'outline' {
    return role === 'admin' ? 'default' : 'secondary';
  }

  getVerifiedBadgeType(verified: boolean): 'default' | 'secondary' | 'destructive' | 'outline' {
    return verified ? 'default' : 'outline';
  }
}
