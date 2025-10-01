import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

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
      const token = this.getToken();
      if (!token) return;

      const userId = this.getUserIdFromToken(token);
      this.getUser(userId).subscribe({
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

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`https://fakestoreapi.com/users/${id}`)
  }

  async login(request: { username: string, password: string }): Promise<boolean> {
    console.log("Auth: Login in...");

    return new Promise<boolean>((resolve, reject) => {
      this.http.post<{ token: string } | null>('https://fakestoreapi.com/auth/login', request).subscribe({
        next: async (response: { token: string } | null) => {
          if (!response?.token) {
            reject(new Error("Auth: Login failed"));
            return;
          }

          this.saveToken(response.token);
          this.init();
          resolve(true);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  register(request: Partial<User>) {
    return this.http.post<User>('https://fakestoreapi.com/users', request);
  }

  logout() {
    console.log("Auth: Logout");
    this.user.set(null);
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
  }

  saveToken(token: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `auth_token=${token}; path=/; expires=${expires}; SameSite=Strict`;
  }

  getToken() {
    try {
      if (!document) return null;

      return document.cookie
        .split('; ')
        .find(cookie => cookie.startsWith('auth_token='))
        ?.split('=')[1] ?? null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  getUserIdFromToken(token: string) {
    return this.parseJwt(token).sub;
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
