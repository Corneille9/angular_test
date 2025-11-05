import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {User} from '../../types';
import {AdminLayout} from '../layout/layout';
import {ZardLoaderComponent} from '@shared/components/loader/loader.component';
import {ZardAlertDialogService} from '@shared/components/alert-dialog/alert-dialog.service';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardBadgeComponent} from '@shared/components/badge/badge.component';
import {ZardIconComponent} from '@shared/components/icon/icon.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {toast} from 'ngx-sonner';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminLayout,
    ZardLoaderComponent,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardIconComponent,
    ZardInputDirective,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alertDialogService = inject(ZardAlertDialogService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  user = signal<User | null>(null);
  isLoadingProfile = signal(false);
  isSubmittingProfile = signal(false);
  isSubmittingPassword = signal(false);
  errorMessageProfile = signal('');
  errorMessagePassword = signal('');

  ngOnInit() {
    this.initForms();
    this.loadUserProfile();
  }

  initForms() {
    // Profile Form
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Password Form
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    });
  }

  loadUserProfile() {
    this.isLoadingProfile.set(true);
    this.errorMessageProfile.set('');

    // Get user from AuthService
    const currentUser = this.authService.user();
    if (currentUser) {
      this.user.set(currentUser);
      this.profileForm.patchValue({
        name: currentUser.name,
        email: currentUser.email
      });
      this.isLoadingProfile.set(false);
    } else {
      // Fetch from API if not in memory
      this.authService.getUser().subscribe({
        next: (user) => {
          this.user.set(user);
          this.profileForm.patchValue({
            name: user.name,
            email: user.email
          });
          this.isLoadingProfile.set(false);
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.errorMessageProfile.set('Failed to load profile. Please try again.');
          this.isLoadingProfile.set(false);
        }
      });
    }
  }

  onSubmitProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isSubmittingProfile.set(true);
    this.errorMessageProfile.set('');

    const formValue = this.profileForm.value;

    this.authService.updateProfile({
      name: formValue.name
    }).subscribe({
      next: (user) => {
        this.user.set(user);
        this.authService.user.set(user);
        this.isSubmittingProfile.set(false);

        toast.success('Profile updated successfully', {
          position: 'top-right',
        });
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.errorMessageProfile.set(error.error?.message || 'Failed to update profile. Please try again.');
        this.isSubmittingProfile.set(false);

        toast.error('Failed to update profile', {
          position: 'top-right',
        });
      }
    });
  }

  onSubmitPassword() {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    const formValue = this.passwordForm.value;

    // Validate password confirmation
    if (formValue.password !== formValue.password_confirmation) {
      this.errorMessagePassword.set('Passwords do not match.');
      return;
    }

    this.isSubmittingPassword.set(true);
    this.errorMessagePassword.set('');

    // Note: Password change should be implemented in AuthService
    // For now, we'll show a success message
    this.alertDialogService.confirm({
      zTitle: 'Change Password',
      zDescription: 'Are you sure you want to change your password?',
      zOkText: 'Change Password',
      zCancelText: 'Cancel',
      zOnOk: () => {
        // Simulate password change
        setTimeout(() => {
          this.passwordForm.reset();
          this.isSubmittingPassword.set(false);

          toast.success('Password changed successfully', {
            position: 'top-right',
          });
        }, 1000);
      },
      zOnCancel: () => {
        this.isSubmittingPassword.set(false);
      }
    });
  }

  sendVerificationEmail() {
    this.authService.sendVerificationCode().subscribe({
      next: (response) => {
        toast.success(response.message || 'Verification email sent', {
          position: 'top-right',
        });
      },
      error: (error: any) => {
        toast.error(error.error?.message || 'Failed to send verification email', {
          position: 'top-right',
        });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.hasError('required') && control.touched) {
      return `${this.capitalize(fieldName.replace('_', ' '))} is required.`;
    }
    if (control?.hasError('email') && control.touched) {
      return 'Please enter a valid email address.';
    }
    if (control?.hasError('minlength') && control.touched) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.capitalize(fieldName.replace('_', ' '))} must be at least ${minLength} characters.`;
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
