import {Component, inject, signal} from '@angular/core';
import {AdminService, DashboardStats} from '../../services/admin/admin.service';
import {ZardCardComponent} from '@shared/components/card/card.component';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {Layout} from '../../layout/layout';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-dashbaord',
  imports: [
    ZardCardComponent,
    ZardLoaderComponent,
    Layout,
    RouterLink
  ],
  templateUrl: './dashbaord.html',
  styleUrl: './dashbaord.css'
})
export class Dashbaord {
  private adminService = inject(AdminService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading.set(false);
      }
    });
  }
}
