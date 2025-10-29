import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse, Payment} from '../../types';
import {API_BASE_URL} from '../../config/api';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);

  isLoading = signal(false);

  // User Payment Methods
  getUserPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${API_BASE_URL}/payments`);
  }

  getPayment(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${API_BASE_URL}/payments/${id}`);
  }
}

