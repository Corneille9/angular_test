import {Component, inject} from '@angular/core';
import {ZardMenuModule} from '@shared/components/menu/menu.module';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardDividerComponent} from '@shared/components/divider/divider.component';
import {RouterLink} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {CartButton} from '@shared/components/cart-button/cart-button';


@Component({
  selector: 'app-layout',
  imports: [ZardMenuModule, ZardButtonComponent, ZardDividerComponent, RouterLink, CartButton],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;

  constructor() {
  }

  logout() {
    this.authService.logout();
  }

  protected log = (item: string) => {
    console.log('Navigate to:', item);
  }
}
