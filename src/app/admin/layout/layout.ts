import {Component, inject, signal} from '@angular/core';
import {LayoutComponent} from '@shared/components/layout/layout.component';
import {SidebarComponent, SidebarGroupComponent, SidebarGroupLabelComponent} from '@shared/components/layout/sidebar.component';
import {ZardIconComponent} from '@shared/components/icon/icon.component';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardMenuDirective} from '@shared/components/menu/menu.directive';
import {ZardMenuContentDirective} from '@shared/components/menu/menu-content.directive';
import {ZardMenuItemDirective} from '@shared/components/menu/menu-item.directive';
import {ZardAvatarComponent} from '@shared/components/avatar/avatar.component';
import {ZardDividerComponent} from '@shared/components/divider/divider.component';
import {ContentComponent} from '@shared/components/layout/content.component';
import {ZardBreadcrumbComponent, ZardBreadcrumbItemComponent} from '@shared/components/breadcrumb/breadcrumb.component';
import {Router, RouterLink} from '@angular/router';
import {ZardIcon} from '@shared/components/icon/icons';
import {AuthService} from '../../services/auth/auth.service';
import {toast} from 'ngx-sonner';
import {DarkModeService} from '../../services/darkmode/darkmode.service';

interface MenuItem {
  icon: ZardIcon | any;
  label: string;
  submenu?: { label: string }[];
  url?: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    LayoutComponent,
    SidebarGroupComponent,
    SidebarComponent,
    SidebarGroupLabelComponent,
    ZardIconComponent,
    ZardButtonComponent,
    ZardMenuDirective,
    ZardMenuContentDirective,
    ZardMenuItemDirective,
    ZardAvatarComponent,
    ZardDividerComponent,
    ContentComponent,
    ZardBreadcrumbComponent,
    ZardBreadcrumbItemComponent,
    RouterLink
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class AdminLayout {
  protected router = inject(Router);
  private authService = inject(AuthService);
  private readonly darkmodeService = inject(DarkModeService);

  sidebarCollapsed = signal(false);
  currentPage = signal('Dashboard');

  // @ts-ignore
  mainMenuItems: MenuItem[] = [
    {icon: 'layout-dashboard', label: 'Dashboard', url: '/admin/dashboard'},
    {icon: 'layout-dashboard', label: 'Products', url: '/admin/products'},
    {icon: 'layout-dashboard', label: 'Orders', url: '/admin/orders'},
    {icon: 'layout-dashboard', label: 'Payments', url: '/admin/payments'},
  ];

  workspaceMenuItems: MenuItem[] = [
    {icon: 'users', label: 'Users', url: '/admin/users'},
    {icon: 'folder', label: 'Categories', url: '/admin/categories'},
    {icon: 'settings', label: 'Settings', url: '/admin/settings'},
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  onCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }

  async logout() {
    try {
      await this.authService.logout();
      toast.success('Logged out successfully', {
        position: 'top-right',
      });
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      this.router.navigate(['/login']);
    }
  }

  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.darkmodeService.getCurrentTheme();
  }
}
