import {Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AdminService} from '../../services/admin/admin.service';
import {Product} from '../../types';
import {Layout} from '../../layout/layout';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    Layout
  ],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  selectedProduct = signal<Product | null>(null);

  columns = [
    {key: 'id', label: 'ID', width: '80px'},
    {key: 'image', label: 'Image', width: '100px'},
    {key: 'title', label: 'Title', width: '300px'},
    {key: 'category', label: 'Category', width: '150px'},
    {key: 'price', label: 'Price', width: '100px'},
    {key: 'actions', label: 'Actions', width: '200px'}
  ];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // this.isLoading.set(true);
    // this.adminService.getAllProducts().subscribe({
    //   next: (data) => {
    //     this.products.set(data);
    //     this.isLoading.set(false);
    //   },
    //   error: (error) => {
    //     console.error('Error loading products:', error);
    //     this.isLoading.set(false);
    //   }
    // });
  }

  editProduct(product: Product) {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  deleteProduct(product: Product) {
    // if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    //   this.adminService.deleteProduct(product.id).subscribe({
    //     next: () => {
    //       this.products.set(this.products().filter(p => p.id !== product.id));
    //       alert('Product deleted successfully!');
    //     },
    //     error: (error: any) => {
    //       console.error('Error deleting product:', error);
    //       alert('Error deleting product');
    //     }
    //   });
    // }
  }

  addNewProduct() {
    this.router.navigate(['/admin/products/new']);
  }
}
