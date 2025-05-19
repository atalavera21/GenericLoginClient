import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/auth/loading.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import {
  LoginRequest,
  LoginResponse,
} from '../../../core/models/auth/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    CardModule,
    DividerModule,
    CheckboxModule,
    SpinnerComponent,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
      recordarme: [false],
    });
  }

  // Modificación en el método onSubmit de LoginComponent
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    const loginData: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('contrasena')?.value,
      rememberMe: this.loginForm.get('recordarme')?.value,
    };

    this.authService.login(loginData).subscribe({
      next: (response: LoginResponse) => {
        this.loadingService.hide();

        if (response.success) {
          // Guardar el token en localStorage o sessionStorage según recordarme
          if (loginData.rememberMe) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem(
              'user_data',
              JSON.stringify({
                userId: response.userId,
                email: response.email,
                nombres: response.nombres,
                apellidos: response.apellidos,
              })
            );
          } else {
            sessionStorage.setItem('auth_token', response.token);
            sessionStorage.setItem(
              'user_data',
              JSON.stringify({
                userId: response.userId,
                email: response.email,
                nombres: response.nombres,
                apellidos: response.apellidos,
              })
            );
          }

          // Aquí determinaríamos el rol basado en la respuesta del backend
          // Como no tienes definidos los roles aún, puedes establecer un rol predeterminado
          // por ahora (esto se modificaría cuando implementes roles reales)
          this.authService.setUserRole('user'); // O 'user' según lo que necesites

          this.messageService.add({
            severity: 'success',
            summary: 'Inicio de sesión exitoso',
            detail: `Bienvenido, ${response.nombres}!`,
          });

          // Redirigir según el rol
          setTimeout(() => {
            this.authService.redirectBasedOnRole();
          }, 1500);
        } else {
          // Si la API devuelve success: false pero no es un error HTTP
          this.handleLoginErrors(response.errors || [response.mensaje]);
        }
      },
      error: (error) => {
        // El resto del código de manejo de errores se mantiene igual
        // ...
      },
    });
  }

  private handleLoginErrors(errors: string[]) {
    errors.forEach((err: string) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de inicio de sesión',
        detail: err,
      });
    });
  }

  // Métodos para iniciar sesión con proveedores externos
  loginWithGoogle() {
    // Implementar la lógica para iniciar sesión con Google
    // Por ejemplo:
    // this.authService.loginWithGoogle().subscribe({...});
    console.log('Login with Google clicked');
  }

  loginWithFacebook() {
    // Implementar la lógica para iniciar sesión con Facebook
    console.log('Login with Facebook clicked');
  }

  loginWithTwitter() {
    // Implementar la lógica para iniciar sesión con Twitter
    console.log('Login with Twitter clicked');
  }
}
