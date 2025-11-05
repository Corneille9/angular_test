import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {inject} from '@angular/core';
import {TokenService} from '../services/auth/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.hasToken()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
