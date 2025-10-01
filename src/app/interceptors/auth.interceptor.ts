import {HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {PLATFORM_ID} from '@angular/core';

const getToken = () => {
  try {
    if (!isPlatformBrowser(PLATFORM_ID)) return null;

    return document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith('auth_token='))
      ?.split('=')[1] ?? null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authToken = getToken();

  if (!authToken) {
    return next(req);
  }

  console.log("Auth: Interceptor called: ", authToken)

  const newReq = req.clone({
    headers: req.headers.append('Authorization', authToken),
  });

  return next(newReq);
}
