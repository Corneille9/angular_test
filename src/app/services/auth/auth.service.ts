import {computed, inject, Injectable, OnInit, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthResponse, User} from '../../types/user';
import {API_BASE_URL} from '../../config/api';
import {TokenService} from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  user = signal<User | null>(null);
  isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    this.init();
  }

  init(): void {
    try {
      console.log("Auth: ngOnInit")
      const tokenService = inject(TokenService);

      const token = tokenService.getToken();
      if (!token) return;

      this.getUser().subscribe({
        next: (user: User) => {
          this.user.set(user);
        },
        error: (error: any) => {
          console.error(error);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  getUser(): Observable<User> {
    return this.http.post<User>(`${API_BASE_URL}/auth/me`, {})
  }

  async login(request: { email: string, password: string }): Promise<boolean> {
    console.log("Auth: Login in...");

    return new Promise<boolean>((resolve, reject) => {
      this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, request).subscribe({
        next: async (response: AuthResponse) => {
          if (!response?.token) {
            reject(new Error("Auth: Login failed"));
            return;
          }

          this.saveToken(response.token);
          this.user.set(response.user);
          resolve(true);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  register(request: Record<string, any>) {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, request).subscribe({
        next: async (response: AuthResponse) => {
          if (!response?.token) {
            reject(new Error("Auth: Login failed"));
            return;
          }

          this.saveToken(response.token);
          this.user.set(response.user);
          resolve(true);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  logout() {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<AuthResponse>(`${API_BASE_URL}/auth/logout`, {}).subscribe({
        next: async (response: AuthResponse) => {
          console.log("Auth: Logout");
          this.user.set(null);
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
          resolve(true);
        },
        error: (error: any) => {
          console.log("Auth: Logout");
          this.user.set(null);
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
          reject(error);
        }
      });
    });
  }

  saveToken(token: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `auth_token=${token}; path=/; expires=${expires}; SameSite=None; Secure`;
  }


  parseJwt(token: string): { sub: number, iat: number, user: string } {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }
}
