import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductService} from '../../services/product/product.service';
import {Category, StoreCategoryRequest, UpdateCategoryRequest} from '../../types';
import {AdminLayout} from '../layout/layout';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardAlertDialogService} from '@shared/components/alert-dialog/alert-dialog.service';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardIconComponent} from '@shared/components/icon/icon.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {ZardSelectComponent} from '@shared/components/select/select.component';
import {ZardSelectItemComponent} from '@shared/components/select/select-item.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminLayout,
    ZardLoaderComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css'
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private alertDialogService = inject(ZardAlertDialogService);

  categoryForm!: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  categoryId: number | null = null;
  isEditMode = signal(false);

  // Categories for parent selection
  categories = signal<Category[]>([]);
  isLoadingCategories = signal(false);
  selectedParent = 'none';

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    this.checkEditMode();
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parent_id: [null]
    });
  }

  loadCategories() {
    this.isLoadingCategories.set(true);
    this.productService.getCategories({per_page: 100}).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.isLoadingCategories.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories.set(false);
      }
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.categoryId = parseInt(id);
      this.isEditMode.set(true);
      this.loadCategory(this.categoryId);
    }
  }

  loadCategory(id: number) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getCategory(id).subscribe({
      next: (response) => {
        const category = response.data;
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description,
          parent_id: category.parent_id
        });
        this.selectedParent = category.parent_id ? category.parent_id.toString() : 'none';
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.errorMessage.set('Failed to load category data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onParentChange(value: string) {
    this.selectedParent = value;
    this.categoryForm.patchValue({
      parent_id: value === 'none' ? null : parseInt(value)
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory() {
    const formValue = this.categoryForm.value;
    const data: StoreCategoryRequest = {
      name: formValue.name,
      description: formValue.description || null,
      parent_id: formValue.parent_id
    };

    this.productService.createCategory(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: 'Category has been created successfully.',
          zOkText: 'OK',
          zClosable: false,
          zOnOk: () => this.router.navigate(['/admin/categories'])
        });
      },
      error: (error: any) => {
        console.error('Error creating category:', error);
        this.errorMessage.set(error.error?.message || 'Failed to create category. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  updateCategory() {
    const formValue = this.categoryForm.value;
    const data: UpdateCategoryRequest = {
      name: formValue.name,
      description: formValue.description || null,
      parent_id: formValue.parent_id
    };

    this.productService.updateCategory(this.categoryId!, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: 'Category has been updated successfully.',
          zOkText: 'OK',
          zClosable: false,
          zOnOk: () => this.router.navigate(['/admin/categories'])
        });
      },
      error: (error: any) => {
        console.error('Error updating category:', error);
        this.errorMessage.set(error.error?.message || 'Failed to update category. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/categories']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.categoryForm.get(fieldName);
    if (control?.hasError('required') && control.touched) {
      return `${this.capitalize(fieldName)} is required.`;
    }
    if (control?.hasError('minlength') && control.touched) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.capitalize(fieldName)} must be at least ${minLength} characters.`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.categoryForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
