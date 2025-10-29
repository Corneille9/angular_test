import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CheckoutSummaryRequest, CheckoutSummaryResponse, ConfirmPaymentRequest, ConfirmPaymentResponse, ProcessCheckoutRequest, ProcessCheckoutResponse} from '../../types';
import {API_BASE_URL} from '../../config/api';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  isLoading = signal(false);
  private http = inject(HttpClient);

  getCheckoutSummary(data: CheckoutSummaryRequest): Observable<CheckoutSummaryResponse> {
    return this.http.post<CheckoutSummaryResponse>(`${API_BASE_URL}/checkout/summary`, data);
  }

  processCheckout(data: ProcessCheckoutRequest): Observable<ProcessCheckoutResponse> {
    return this.http.post<ProcessCheckoutResponse>(`${API_BASE_URL}/checkout/process`, data);
  }

  confirmPayment(data: ConfirmPaymentRequest): Observable<ConfirmPaymentResponse> {
    return this.http.post<ConfirmPaymentResponse>(`${API_BASE_URL}/checkout/confirm-payment`, data);
  }
}

