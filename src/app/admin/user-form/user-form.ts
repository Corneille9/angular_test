import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AdminService} from '../../services/admin/admin.service';
import {CreateUserRequest, UpdateUserRequest, UserRole} from '../../types';
import {AdminLayout} from '../layout/layout';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardAlertDialogService} from '@shared/components/alert-dialog/alert-dialog.service';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardIconComponent} from '@shared/components/icon/icon.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {ZardSelectComponent} from '@shared/components/select/select.component';
import {ZardSelectItemComponent} from '@shared/components/select/select-item.component';

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private alertDialogService = inject(ZardAlertDialogService);

  userForm!: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  userId: number | null = null;
  isEditMode = signal(false);
  selectedRole = 'user';

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  initForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      password_confirmation: [''],
      role: ['user', Validators.required]
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.userId = parseInt(id);
      this.isEditMode.set(true);
      this.loadUser(this.userId);
      // Password not required for edit
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      // Password required for create
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(id: number) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getUser(id).subscribe({
      next: (response) => {
        const user = response.data;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
        this.selectedRole = user.role;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.errorMessage.set('Failed to load user data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onRoleChange(value: string) {
    this.selectedRole = value;
    this.userForm.patchValue({ role: value });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    const formValue = this.userForm.value;

    // Validate password confirmation
    if (formValue.password && formValue.password !== formValue.password_confirmation) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateUser(formValue);
    } else {
      this.createUser(formValue);
    }
  }

  createUser(formValue: any) {
    const data: CreateUserRequest = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      password_confirmation: formValue.password_confirmation,
      role: formValue.role as UserRole
    };

    this.adminService.createUser(data).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);

        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: 'User has been created successfully.',
          zOkText: 'OK',
          zClosable: false,
          zOnOk: () => this.router.navigate(['/admin/users'])
        });
      },
      error: (error: any) => {
        console.error('Error creating user:', error);
        this.errorMessage.set(error.error?.message || 'Failed to create user. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  updateUser(formValue: any) {
    const data: UpdateUserRequest = {
      name: formValue.name,
      email: formValue.email,
      role: formValue.role as UserRole
    };

    // Only include password if it's provided
    if (formValue.password) {
      data.password = formValue.password;
      data.password_confirmation = formValue.password_confirmation;
    }

    this.adminService.updateUser(this.userId!, data).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.alertDialogService.info({
          zTitle: 'Success',
          zDescription: 'User has been updated successfully.',
          zOkText: 'OK',
          zClosable: false,
          zOnOk: () => this.router.navigate(['/admin/users'])
        });
      },
      error: (error: any) => {
        console.error('Error updating user:', error);
        this.errorMessage.set(error.error?.message || 'Failed to update user. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required') && control.touched) {
      return `${this.capitalize(fieldName)} is required.`;
    }
    if (control?.hasError('email') && control.touched) {
      return 'Please enter a valid email address.';
    }
    if (control?.hasError('minlength') && control.touched) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.capitalize(fieldName)} must be at least ${minLength} characters.`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
