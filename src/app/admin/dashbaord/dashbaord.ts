import {Component, inject, signal} from '@angular/core';
import {AdminService} from '../../services/admin/admin.service';
import {Layout} from '../../layout/layout';

@Component({
  selector: 'app-dashbaord',
  imports: [
    Layout
  ],
  templateUrl: './dashbaord.html',
  styleUrl: './dashbaord.css'
})
export class Dashbaord {
  private adminService = inject(AdminService);

  stats = signal<any | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    // this.adminService.getDashboardStats().subscribe({
    //   next: (data) => {
    //     this.stats.set(data);
    //     this.isLoading.set(false);
    //   },
    //   error: (error) => {
    //     console.error('Error loading stats:', error);
    //     this.isLoading.set(false);
    //   }
    // });
  }
}
