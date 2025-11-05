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
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  forgotForm!: FormGroup;
  isLoading = signal(false);

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.isLoading.set(true)

    const email = this.forgotForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading.set(false)

        toast.success("Check your email for a reset code");

        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], {
            queryParams: {email}
          });
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false)

        toast.error(error.error?.message || 'Failed to send reset code');
      }
    });
  }
}
