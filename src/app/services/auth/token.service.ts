import {Inject, Injectable, Optional, PLATFORM_ID, REQUEST} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TokenService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request?: Request
  ) {
  }

  getToken(): string | null {
    const match = document.cookie.match(/auth_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
