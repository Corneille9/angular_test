import {Component, Inject, inject, PLATFORM_ID} from '@angular/core';
import {ZardMenuModule} from '@shared/components/menu/menu.module';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardDividerComponent} from '@shared/components/divider/divider.component';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {CartButton} from '@shared/components/cart-button/cart-button';
import {DarkModeService} from '../services/darkmode/darkmode.service';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';


@Component({
  selector: 'app-layout',
  imports: [ZardMenuModule, ZardButtonComponent, ZardDividerComponent, RouterLink, CartButton],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly darkmodeService = inject(DarkModeService);
  isAuthenticated = this.authService.isAuthenticated;

  constructor(@Inject(PLATFORM_ID) public platformId: Object,) {
  }


  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.darkmodeService.getCurrentTheme();
  }

  logout() {
    this.authService.logout();
  }

  protected log = (item: string) => {
    console.log('Navigate to:', item);
  }
  protected readonly isPlatformServer = isPlatformServer;
  protected readonly isPlatformBrowser = isPlatformBrowser;

  goToOrders() {
    this.router.navigate(['/orders']);
  }
}
