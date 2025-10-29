import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AdminService} from '../../services/admin/admin.service';
import {Layout} from '../../layout/layout';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Layout
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm!: FormGroup;
  isEditMode = signal(false);
  productId = signal<number | null>(null);
  isLoading = signal(false);
  categories = signal<string[]>([]);

  ngOnInit() {
    this.initForm();
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(+id);
      this.loadProduct(+id);
    }
  }

  initForm() {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: ['', [Validators.required]],
      category: ['', [Validators.required]]
    });
  }

  loadCategories() {
    // this.adminService.getCategories().subscribe({
    //   next: (data) => {
    //     this.categories.set(data);
    //   },
    //   error: (error) => {
    //     console.error('Error loading categories:', error);
    //   }
    // });
  }

  loadProduct(id: number) {
    // this.isLoading.set(true);
    // this.adminService.getProduct(id).subscribe({
    //   next: (product) => {
    //     this.productForm.patchValue({
    //       title: product.name,
    //       price: product.price,
    //       description: product.description,
    //       image: product.image,
    //       category: product.category
    //     });
    //     this.isLoading.set(false);
    //   },
    //   error: (error) => {
    //     console.error('Error loading product:', error);
    //     this.isLoading.set(false);
    //     alert('Error loading product');
    //     this.router.navigate(['/admin/products']);
    //   }
    // });
  }

  onSubmit() {
    // if (this.productForm.invalid) {
    //   Object.keys(this.productForm.controls).forEach(key => {
    //     const control = this.productForm.get(key);
    //     if (control?.invalid) {
    //       control.markAsTouched();
    //     }
    //   });
    //   return;
    // }
    //
    // this.isLoading.set(true);
    // const formData = this.productForm.value;
    //
    // const request = this.isEditMode()
    //   ? this.adminService.updateProduct(this.productId()!, formData)
    //   : this.adminService.createProduct(formData);
    //
    // request.subscribe({
    //   next: () => {
    //     alert(this.isEditMode() ? 'Product updated successfully!' : 'Product created successfully!');
    //     this.router.navigate(['/admin/products']);
    //   },
    //   error: (error) => {
    //     console.error('Error saving product:', error);
    //     alert('Error saving product');
    //     this.isLoading.set(false);
    //   }
    // });
  }

  cancel() {
    this.router.navigate(['/admin/products']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${fieldName} must be at least ${minLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${fieldName} must be greater than 0`;
    }
    return '';
  }
}
