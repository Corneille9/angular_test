import {HttpHandlerFn, HttpRequest} from '@angular/common/http';

export function cacheInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {

  const newReq = req.clone({
    setHeaders: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    }
  });

  return next(newReq);
}
