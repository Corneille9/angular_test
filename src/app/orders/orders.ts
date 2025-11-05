import {Component, inject, OnInit, signal} from '@angular/core';
import {Layout} from '../layout/layout';
import {OrderService} from '../services/order/order.service';
import {Order} from '../types/order';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [
    Layout,
    ZardLoaderComponent,
    DatePipe
  ],
  template: `
    <app-layout>
      <div layoutMain class="p-6 max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">My Orders</h1>

        @if (isLoading()) {
          <div class="text-center py-12">
            <z-loader />
          </div>
        } @else if (orders().length > 0) {
          <div class="space-y-4">
            @for (order of orders(); track order.id) {
              <div class="bg-background shadow rounded-xl p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-semibold text-lg">Order #{{ order.id }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ order.created_at | date: 'medium' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-lg">\${{ order.total }}</p>
                    <span
                      class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      [class]="getStatusClass(order.status)"
                    >
                      {{ order.status }}
                    </span>
                  </div>
                </div>

                @if (order.items && order.items.length > 0) {
                  <div class="border-t pt-4 space-y-2">
                    @for (item of order.items; track item.id) {
                      <div class="flex justify-between text-sm">
                        <span>{{ item.product?.name }} × {{ item.quantity }}</span>
                        <span class="font-medium">\${{ item.subtotal }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-sm text-muted-foreground">
                    {{ order.items_count }} item(s)
                  </p>
                }
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-12">
            <i class="icon-shopping-bag text-4xl text-muted-foreground mb-2"></i>
            <p class="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <button
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              (click)="continueShopping()"
            >
              Start Shopping
            </button>
          </div>
        }
      </div>
    </app-layout>
  `,
  standalone: true
})
export class UserOrders implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (response) => {
        this.orders.set(response.data || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}

