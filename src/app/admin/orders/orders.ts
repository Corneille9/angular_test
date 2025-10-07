import {Component, inject, signal} from '@angular/core';
import {Layout} from "../../layout/layout";
import {ReactiveFormsModule} from "@angular/forms";
import {ZardButtonComponent} from "@shared/components/button/button.component";
import {ZardCardComponent} from "@shared/components/card/card.component";
import {ZardLoaderComponent} from "@shared/components/loader/loader.component";
import {ZardSelectComponent} from "@shared/components/select/select.component";
import {AdminService, Order} from '../../services/admin/admin.service';

@Component({
  selector: 'app-orders',
  imports: [
    Layout,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardLoaderComponent,
    ZardSelectComponent
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders {
  private adminService = inject(AdminService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  selectedOrder = signal<Order | null>(null);

  statusOptions: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.adminService.getAllOrders().subscribe({
      next: (data) => {
        const orders: Order[] = data.map(cart => ({
          id: cart.id,
          userId: cart.userId,
          date: cart.date,
          products: cart.products || [],
          status: 'pending' as Order['status'],
          total: this.calculateTotal(cart.products || [])
        }));
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading.set(false);
      }
    });
  }

  calculateTotal(products: any[]): number {
    // En production, tu calculerais le vrai total avec les prix des produits
    return products.reduce((sum, p) => sum + (p.quantity * 10), 0); // Simulation
  }

  updateStatus(order: Order, newStatus: Order['status']) {
    this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        // Update local state
        const updatedOrders = this.orders().map(o =>
          o.id === order.id ? {...o, status: newStatus} : o
        );
        this.orders.set(updatedOrders);
        alert('Order status updated successfully!');
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        alert('Error updating order status');
      }
    });
  }

  getStatusColor(status: Order['status']): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder.set(order);
  }

  closeDetails() {
    this.selectedOrder.set(null);
  }
}
