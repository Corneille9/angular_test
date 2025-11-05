import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AdminService} from '../../services/admin/admin.service';
import {AdminLayout} from '../layout/layout';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardCardComponent} from '@shared/components/card/card.component';
import {DashboardStatistics} from '../../types';

@Component({
  selector: 'app-dashbaord',
  imports: [
    CommonModule,
    RouterLink,
    AdminLayout,
    ZardLoaderComponent,
    ZardCardComponent
  ],
  templateUrl: './dashbaord.html',
  styleUrl: './dashbaord.css'
})
export class Dashbaord implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<DashboardStatistics | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getDashboardStatistics().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.errorMessage.set('Failed to load dashboard statistics');
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
