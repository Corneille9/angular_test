import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductService} from '../../services/product/product.service';
import {AdminLayout} from '../layout/layout';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent, ZardFormMessageComponent} from '@shared/components/form/form.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {ZardAlertDialogService} from '@shared/components/alert-dialog/alert-dialog.service';
import {Category} from '../../types';
import {toast} from 'ngx-sonner';
import {SERVER_URL} from '../../config/api';
import {getImageUrl} from '@shared/utils/utils';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminLayout,
    ZardLoaderComponent,
    ZardButtonComponent,
    ZardFormControlComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormMessageComponent,
    ZardInputDirective
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertDialogService = inject(ZardAlertDialogService);

  productForm!: FormGroup;
  isEditMode = signal(false);
  productId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  categories = signal<Category[]>([]);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  errorMessage = signal('');

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
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      category_ids: [[], [Validators.required, Validators.minLength(1)]],
      image: [null]
    });
  }

  loadCategories() {
    this.productService.getCategories({per_page: 100}).subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProduct(id: number) {
    this.isLoading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (response) => {
        const product = response.data;
        this.productForm.patchValue({
          name: product.name,
          price: product.price,
          stock: product.stock,
          description: product.description,
          category_ids: product.categories.map(c => c.id)
        });

        if (product.image) {
          this.imagePreview.set(getImageUrl(product.image));
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load product');

        this.alertDialogService.warning({
          zTitle: 'Error',
          zDescription: 'Failed to load product. Redirecting to products list.',
          zOkText: 'OK',
          zClosable: false,
          zOnOk: () => {
            this.router.navigate(['/admin/products']);
          }
        });
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Too Large. Image size must be less than 5MB')
        return;
      }

      this.selectedFile.set(file);

      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  toggleCategory(categoryId: number) {
    const categoryIds = this.productForm.get('category_ids')?.value || [];
    const index = categoryIds.indexOf(categoryId);

    if (index > -1) {
      categoryIds.splice(index, 1);
    } else {
      categoryIds.push(categoryId);
    }

    this.productForm.patchValue({category_ids: categoryIds});
  }

  isCategorySelected(categoryId: number): boolean {
    const categoryIds = this.productForm.get('category_ids')?.value || [];
    return categoryIds.includes(categoryId);
  }

  onSubmit() {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formValue = this.productForm.value;
    const productData: any = {
      name: formValue.name,
      price: formValue.price,
      stock: formValue.stock,
      description: formValue.description || null,
      category_ids: formValue.category_ids || []
    };

    if (this.selectedFile()) {
      productData.image = this.selectedFile();
    }

    const request = this.isEditMode()
      ? this.productService.updateProduct(this.productId()!, productData)
      : this.productService.createProduct(productData);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);

        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: this.isEditMode()
            ? 'Product updated successfully!'
            : 'Product created successfully!',
          zOkText: 'OK',
          zClosable: false,
          zOnOk: () => {
            this.router.navigate(['/admin/products']);
          }
        });

      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Error saving product:', error);

        const errorMsg = error.error?.message || error.error?.errors
          || 'Failed to save product. Please try again.';

        this.errorMessage.set(errorMsg);

        toast.error(errorMsg);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/products']);
  }
}

