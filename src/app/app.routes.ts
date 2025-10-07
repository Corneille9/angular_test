import {Routes} from '@angular/router';
import {Login} from './auth/login/login';
import {Register} from './auth/register/register';
import {Home} from './home/home';
import {guestGuard} from './guards/guest-guard';
import {authGuard} from './guards/auth-guard';
import {Checkout} from './checkout/checkout';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'login', component: Login, canActivate: [guestGuard]},
  {path: 'register', component: Register, canActivate: [guestGuard]},
  {path: 'checkout', component: Checkout, canActivate: [authGuard]},
];
