import {Routes} from '@angular/router';
import {Login} from './auth/login/login';
import {Register} from './auth/register/register';
import {Home} from './home/home';
import {guestGuard} from './guards/guest-guard';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'login', component: Login, canActivate: [guestGuard]},
  {path: 'register', component: Register, canActivate: [guestGuard]},
];
