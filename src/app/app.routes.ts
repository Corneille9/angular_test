import {Routes} from '@angular/router';
import {Login} from './auth/login/login';
import {Register} from './auth/register/register';
import {Home} from './home/home';
import {guestGuard} from './guards/guest-guard';
import {authGuard} from './guards/auth-guard';
import {verifyEmailGuard} from './guards/verify-email-guard';
import {Checkout} from './checkout/checkout';
import {UserOrders} from './orders/orders';
import {Dashbaord} from './admin/dashbaord/dashbaord';
import {Products} from './admin/products/products';
import {ProductForm} from './admin/product-form/product-form';
import {Orders} from './admin/orders/orders';
import {CheckoutSuccess} from './checkout/success/success';
import {CheckoutCancel} from './checkout/cancel/cancel';
import {VerifyEmailComponent} from './auth/verify-email/verify-email';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password';
import {ResetPasswordComponent} from './auth/reset-password/reset-password';
import {UsersComponent} from './admin/users/users';
import {UserFormComponent} from './admin/user-form/user-form';
import {CategoriesComponent} from './admin/categories/categories';
import {CategoryFormComponent} from './admin/category-form/category-form';
import {PaymentsComponent} from './admin/payments/payments';
import {Settings} from './admin/settings/settings';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'auth/login', component: Login, canActivate: [guestGuard]},
  {path: 'auth/register', component: Register, canActivate: [guestGuard]},
  {path: 'auth/verify-email', component: VerifyEmailComponent, canActivate: [authGuard]},
  {path: 'auth/forgot-password', component: ForgotPasswordComponent},
  {path: 'auth/reset-password', component: ResetPasswordComponent},

  // Legacy routes for backward compatibility
  {path: 'login', redirectTo: 'auth/login', pathMatch: 'full'},
  {path: 'register', redirectTo: 'auth/register', pathMatch: 'full'},

  // Routes requiring email verification
  {path: 'checkout', component: Checkout, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'checkout/success', component: CheckoutSuccess, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'checkout/cancel', component: CheckoutCancel, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'orders', component: UserOrders, canActivate: [authGuard, verifyEmailGuard]},

  // Admin routes requiring email verification
  {path: 'admin/dashboard', component: Dashbaord, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/products', component: Products, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/products/new', component: ProductForm, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/products/:id', component: ProductForm, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/orders', component: Orders, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/users', component: UsersComponent, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/users/new', component: UserFormComponent, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/users/:id', component: UserFormComponent, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/categories', component: CategoriesComponent, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/categories/new', component: CategoryFormComponent, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/categories/:id', component: CategoryFormComponent, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/payments', component: PaymentsComponent, canActivate: [authGuard, verifyEmailGuard]},
  {path: 'admin/settings', component: Settings, canActivate: [authGuard, verifyEmailGuard]},
];
