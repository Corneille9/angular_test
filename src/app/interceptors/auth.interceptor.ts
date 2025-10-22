import {HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {TokenService} from '../services/auth/token.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const tokenService = inject(TokenService);
  const authToken = tokenService.getToken();

  if (!authToken) {
    console.log("Auth: No token found");
    return next(req);
  }

  console.log("Auth: Interceptor called: ", authToken);

  const newReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return next(newReq);
}
