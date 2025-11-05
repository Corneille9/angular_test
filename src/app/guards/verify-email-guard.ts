import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';

/**
 * Guard to check if the user has verified their email
 * If not verified, redirect to verify-email page
 */
export const verifyEmailGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();

  // If no user, let auth guard handle it
  if (!user) {
    return true;
  }

  if (!user.has_verified_email) {
    console.log('Email not verified, redirecting to verify-email page');
    router.navigate(['/auth/verify-email']);
    return false;
  }

  return true;
};
