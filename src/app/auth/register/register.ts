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
      username: new FormControl('ang@gmail.com', [Validators.required, Validators.min(3)]),
      email: new FormControl('ang4353', [Validators.required, Validators.min(3)]),
      password: new FormControl('123456789', [Validators.required]),
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
      this.authService.register({
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      }).subscribe({
        next: (user: User) => {
          this.isLoading.set(false);
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.errorMessage.set("An error occurred. Please try again");
          console.error(error);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });

    } catch (e) {
      this.errorMessage.set("An error occurred. Please try again");
      console.error(e);
    } finally {
    }
  }
}
