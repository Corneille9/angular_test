import {Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ZardFormFieldComponent} from '@shared/components/form/form.component';
import {ZardFormModule} from '@shared/components/form/form.module';
import {ZardInputDirective} from '@shared/components/input/input.directive';
import {ZardButtonComponent} from '@shared/components/button/button.component';
import {ZardCardComponent} from '@shared/components/card/card.component';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ZardFormModule, ZardFormFieldComponent, ZardInputDirective, ZardButtonComponent, ZardCardComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup;

  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = new FormGroup({
      username: new FormControl('mor_2314', [Validators.required, Validators.min(3)]),
      password: new FormControl('83r5^_', [Validators.required]),
    });
  }

  async onSubmit() {
    try {
      this.errorMessage.set('');

      if (!this.loginForm.valid) {
        this.loginForm.markAllAsTouched();
        return;
      }

      console.log("Login in...")
      this.isLoading.set(true);
      const success = await this.authService.login({
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      });

      if (success) this.router.navigate(['/']);
    } catch (e) {
      this.errorMessage.set("An error occurred. Please verify your credentials");
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }
}
