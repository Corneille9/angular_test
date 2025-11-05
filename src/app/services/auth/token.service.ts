import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TokenService {
  constructor() {
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    const match = document.cookie.match(/auth_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  saveToken(token: string): void {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `auth_token=${token}; path=/; expires=${expires}; SameSite=None; Secure`;
  }

  removeToken(): void {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
  }
}
