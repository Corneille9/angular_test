import {Routes} from '@angular/router';
import {Login} from './auth/login/login';
import {Register} from './auth/register/register';
import {Home} from './home/home';
import {guestGuard} from './guards/guest-guard';
import {authGuard} from './guards/auth-guard';
import {Checkout} from './checkout/checkout';
import {Dashbaord} from './admin/dashbaord/dashbaord';
import {Products} from './admin/products/products';
import {ProductForm} from './admin/product-form/product-form';
import {Orders} from './admin/orders/orders';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'login', component: Login, canActivate: [guestGuard]},
  {path: 'register', component: Register, canActivate: [guestGuard]},
  {path: 'checkout', component: Checkout, canActivate: [authGuard]},
  {path: 'dashboard', component: Dashbaord, canActivate: []},
  {path: 'products', component: Products, canActivate: []},
  {path: 'admin/products/new', component: ProductForm, canActivate: []},
  {path: 'admin/orders', component: Orders, canActivate: []},
];
