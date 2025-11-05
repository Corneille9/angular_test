import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, User} from '../../types';
import {API_BASE_URL} from '../../config/api';
import {TokenService} from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  tokenService = inject(TokenService);

  isInitialized = signal(false);
  user = signal<User | null>(null);
  isAuthenticated = computed(() => this.user() !== null);
  isAdmin = computed(() => this.user()?.role === 'admin');

  hasToken = computed(() => this.tokenService.getToken() !== null);

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    try {
      console.log("Auth: ngOnInit")

      const token = this.tokenService.getToken();
      if (!token) return;

      await new Promise<void>((resolve, reject) => {
        this.getUser().subscribe({
          next: (user: User) => {
            this.user.set(user);
            resolve();
          },
          error: (error: any) => {
            console.error(error);
            reject(error);
          }
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.isInitialized.set(true);
    }
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/auth/me`)
  }

  async login(request: LoginRequest): Promise<boolean> {
    console.log("Auth: Login in...");

    return new Promise<boolean>((resolve, reject) => {
      this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, request).subscribe({
        next: async (response: AuthResponse) => {
          if (!response?.token) {
            reject(new Error("Auth: Login failed"));
            return;
          }

          this.tokenService.saveToken(response.token);
          this.user.set(response.user);
          resolve(true);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  async register(request: RegisterRequest): Promise<{ success: boolean; message?: string }> {
    return new Promise<{ success: boolean; message?: string }>((resolve, reject) => {
      this.http.post<AuthResponse & { message?: string }>(`${API_BASE_URL}/auth/register`, request).subscribe({
        next: async (response) => {
          if (!response?.token) {
            reject(new Error("Auth: Registration failed"));
            return;
          }

          this.tokenService.saveToken(response.token);
          this.user.set(response.user);
          resolve({success: true, message: response.message});
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${API_BASE_URL}/auth/profile/update`, request);
  }

  // Email Verification
  sendVerificationCode(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${API_BASE_URL}/auth/send-verification-code`,
      {}
    );
  }

  verifyEmail(code: string): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.post<{ success: boolean; message: string; user: User }>(
      `${API_BASE_URL}/auth/verify-email`,
      {code}
    );
  }

  // Password Reset
  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${API_BASE_URL}/auth/forgot-password`,
      {email}
    );
  }

  verifyResetCode(email: string, code: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${API_BASE_URL}/auth/verify-reset-code`,
      {email, code}
    );
  }

  resetPassword(
    email: string,
    code: string,
    password: string,
    password_confirmation: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${API_BASE_URL}/auth/reset-password`,
      {email, code, password, password_confirmation}
    );
  }

  async logout(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<{ message: string }>(`${API_BASE_URL}/auth/logout`, {}).subscribe({
        next: async (response) => {
          console.log("Auth: Logout");
          this.user.set(null);
          this.tokenService.removeToken();
          resolve(true);
        },
        error: (error: any) => {
          console.log("Auth: Logout");
          this.user.set(null);
          this.tokenService.removeToken();
          reject(error);
        }
      });
    });
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
