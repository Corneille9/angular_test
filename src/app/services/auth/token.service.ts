import {Inject, Injectable, Optional, PLATFORM_ID, REQUEST} from '@angular/core';
import {isPlatformServer} from '@angular/common';
import type {Request} from 'express';

@Injectable({providedIn: 'root'})
export class TokenService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request?: Request
  ) {
  }

  getToken(): string | null {
    if (isPlatformServer(this.platformId)) {
      const cookieHeader = this.request?.headers?.cookie;
      if (!cookieHeader) return null;

      const match = cookieHeader.match(/auth_token=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    } else {
      const match = document.cookie.match(/auth_token=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
  }
}
