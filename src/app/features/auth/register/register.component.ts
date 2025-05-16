import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterUserRequest } from '../../../core/models/user.model';

import { provideAnimations } from '@angular/platform-browser/animations';
import { LoadingService } from '../../../core/auth/loading.service';
import { SpinnerComponent } from "../../../shared/components/spinner/spinner.component";


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CalendarModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    CardModule,
    DividerModule,
    SpinnerComponent
],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registerForm!: FormGroup;
  loading = false;
  maxDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    public loadingService: LoadingService
  ) {}
  

  ngOnInit() {

    const defaultDate = new Date(2000, 3, 10);

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', Validators.required],      
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      codigoPostal: [''],
      fechaNacimiento: [defaultDate, Validators.required],
      estado: ['', Validators.required],
      pais: ['', Validators.required],
      url: [''],
      telefono: ['', Validators.required],
    }, {
      validatoraas: this.passwordMatchValidator
    });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loadingService.show();

    const userData: RegisterUserRequest = {
      ...this.registerForm.value
    };

    this.authService.register(userData).subscribe({
      next: (response) => {          
        this.loadingService.hide();
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'Se ha enviado un correo de confirmación a tu email.'
          });
          
          // Redirigir después de unos segundos
            setTimeout(() => {
            this.router.navigate(['/']);
            }, 4000);
        }
      },
      error: (error) => {
        this.loadingService.hide();
        
        if (error.error && error.error.errors) {
          // Manejar errores específicos del API
          error.error.errors.forEach((err: string) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error de registro',
              detail: err
            });
          });
        } else {
          // Error genérico
          this.messageService.add({
            severity: 'error',
            summary: 'Error de registro',
            detail: 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo más tarde.'
          });
        }
      }
    });
  }

}
