import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {ZardCardComponent} from '@shared/components/card/card.component';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent, ZardFormMessageComponent} from '@shared/components/form/form.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {toast} from 'ngx-sonner';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ZardCardComponent,
    ZardButtonComponent,
    ZardFormControlComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormMessageComponent,
    ZardInputDirective
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm!: FormGroup;
  isLoading = signal(false);
  email = '';
  showPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (!this.email) {
      this.router.navigate(['/auth/forgot-password']);
      return;
    }

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, {validators: this.passwordMatchValidator});
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    return password === confirmPassword ? null : {passwordMismatch: true};
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.isLoading.set(true)

    const {code, password, password_confirmation} = this.resetForm.value;

    this.authService.resetPassword(this.email, code, password, password_confirmation).subscribe({
      next: (response) => {
        this.isLoading.set(false)

        toast.success("Password reset successfully")

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false)
        toast.error(error.error?.message || 'Failed to reset password')
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
