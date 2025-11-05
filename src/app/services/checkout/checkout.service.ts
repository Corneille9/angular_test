import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_BASE_URL} from '../../config/api';
import {CheckoutSummaryResponse, ProcessCheckoutRequest, ProcessCheckoutResponse, VerifyPaymentRequest, VerifyPaymentResponse} from '../../types';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  isLoading = signal(false);
  private http = inject(HttpClient);

  /**
   * Get checkout summary for current user's cart
   */
  getCheckoutSummary(): Observable<CheckoutSummaryResponse> {
    return this.http.get<CheckoutSummaryResponse>(`${API_BASE_URL}/checkout/summary`);
  }

  /**
   * Process checkout and create Stripe payment link
   */
  processCheckout(data: ProcessCheckoutRequest = {}): Observable<ProcessCheckoutResponse> {
    return this.http.post<ProcessCheckoutResponse>(`${API_BASE_URL}/checkout/process`, data);
  }

  /**
   * Verify payment after Stripe redirect
   */
  verifyPayment(data: VerifyPaymentRequest): Observable<VerifyPaymentResponse> {
    return this.http.post<VerifyPaymentResponse>(`${API_BASE_URL}/checkout/verify-payment`, data);
  }
}

