import {Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from '@angular/router';
import {ZardCardComponent} from '@shared/components/card/card.component';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent, ZardFormMessageComponent} from '@shared/components/form/form.component';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    RouterLink,
    ZardCardComponent,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardFormControlComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormMessageComponent,
    ZardInputDirective
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm: FormGroup;

  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.min(3)]),
      email: new FormControl('', [Validators.required, Validators.min(3)]),
      password: new FormControl('', [Validators.required]),
    });
  }

  async onSubmit() {
    try {
      this.errorMessage.set('');

      if (!this.registerForm.valid) {
        this.registerForm.markAllAsTouched();
        return;
      }

      console.log("Registering in...")
      this.isLoading.set(true);

      const result = await this.authService.register({
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        password_confirmation: this.registerForm.value.password
      });

      if (result.success) {
        this.router.navigate(['/auth/verify-email']);
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e?.error?.message || e?.error?.errors || "An error occurred. Please try again";
      this.errorMessage.set(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
