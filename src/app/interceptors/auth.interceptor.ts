import {HttpErrorResponse, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {TokenService} from '../services/auth/token.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const authToken = tokenService.getToken();

  if (!authToken) {
    console.log("Auth: No token found");
    return next(req);
  }

  const newReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('Auth: 401 Unauthorized - Removing token and redirecting to login');

        // Remove the invalid token
        tokenService.removeToken();


        // Redirect to login page
        router.navigate(['/login'], {
          queryParams: {returnUrl: router.url}
        });
      }

      return throwError(() => error);
    })
  );
}
