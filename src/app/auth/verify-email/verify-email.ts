import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {ZardCardComponent} from '@shared/components/card/card.component';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent, ZardFormMessageComponent} from '@shared/components/form/form.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {toast} from 'ngx-sonner';

@Component({
  selector: 'app-verify-email',
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
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  verifyForm!: FormGroup;
  isLoading = signal(false);
  isResending = signal(false);
  userEmail = '';

  ngOnInit(): void {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d{6}$/)]]
    });

    this.authService.getUser().subscribe({
      next: (user) => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return;
        }

        if (user.has_verified_email) {
          this.router.navigate([this.authService.isAdmin() ? '/admin/dashboard' : '/']);
          return;
        }

        this.userEmail = user.email;
        // Update the signal with fresh user data
        this.authService.user.set(user);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) return;

    this.isLoading.set(true)

    const code = this.verifyForm.value.code;

    this.authService.verifyEmail(code).subscribe({
      next: (response) => {
        this.isLoading.set(false)

        this.authService.user.set(response.user);

        toast.success("Email verified successfully")

        setTimeout(() => {
          this.router.navigate([this.authService.isAdmin() ? '/admin/dashboard' : '/']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false)

        toast.error(error.error?.message || 'Invalid or expired verification code')
      },
    });
  }

  resendCode(): void {
    this.isResending.set(true)

    this.authService.sendVerificationCode().subscribe({
      next: (response) => {
        this.isResending.set(false)
        toast.success("Verification code sent successfully")
      },
      error: (error) => {
        this.isResending.set(false)
        toast.error(error.error?.message || 'Failed to resend verification code');
      }
    });
  }
}
