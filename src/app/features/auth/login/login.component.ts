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
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/auth/loading.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
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
    public loadingService: LoadingService,
    private confirmationService: ConfirmationService
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

    const loginData: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('contrasena')?.value,
      rememberMe: this.loginForm.get('recordarme')?.value || false,
    };

    this.loadingService.show();

    this.authService.login(loginData).subscribe({
      next: (response: LoginResponse) => {
        this.loadingService.hide();

        if (response.success) {
          // ✅ El AuthService ya maneja todo: guardado, estado y redirección
          this.showMessage(
            'success',
            'Inicio de sesión exitoso',
            `Bienvenido, ${response.nombres}!`
          );

          // El AuthService ya redirige automáticamente después de 1.5 segundos
          // No necesitas hacer nada más aquí
        } else {
          // Manejar errores de respuesta
          this.handleLoginErrors(response.errors || [response.mensaje]);
        }
      },
      error: (error) => {
        this.loadingService.hide();
        this.handleHttpError(error);
      },
    });
  }

  /**
   * Maneja errores HTTP del login
   * @param error Error recibido del servidor
   */
  private handleHttpError(error: any): void {
    let errorMessages: string[] = [];

    if (error.error?.errors?.length > 0) {
      errorMessages = error.error.errors;
    } else if (error.error?.mensaje) {
      errorMessages = [error.error.mensaje];
    } else if (error.message) {
      errorMessages = [error.message];
    } else {
      errorMessages = [
        'Ocurrió un error al iniciar sesión. Intenta nuevamente.',
      ];
    }

    this.handleLoginErrors(errorMessages);
  }


    /**
   * Muestra mensajes de error de login
   * @param errors Array de mensajes de error
   */
  private handleLoginErrors(errors: string[]): void {
    errors.forEach((error: string) => {
      this.showMessage('error', 'Error de inicio de sesión', error);
    });
  }

  /**
   * Método helper para mostrar mensajes
   * @param severity Tipo de mensaje (success, error, info, warn)
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   * @param life Duración en milisegundos
   */
  private showMessage(
    severity: string,
    summary: string,
    detail: string,
    life: number = 3000
  ): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life,
    });
  }

  












  // ============================================
  // SOCIAL LOGIN (PLACEHOLDERS)
  // ============================================

  /**
   * Login con Google (implementar según necesidad)
   */
  loginWithGoogle(): void {
    console.log('Login with Google clicked');
    // Implementar lógica de Google OAuth
    this.showMessage('info', 'Google Login', 'Funcionalidad en desarrollo');
  }

  /**
   * Login con Facebook (implementar según necesidad)
   */
  loginWithFacebook(): void {
    console.log('Login with Facebook clicked');
    // Implementar lógica de Facebook OAuth
    this.showMessage('info', 'Facebook Login', 'Funcionalidad en desarrollo');
  }

  /**
   * Login con Twitter (implementar según necesidad)
   */
  loginWithTwitter(): void {
    console.log('Login with Twitter clicked');
    // Implementar lógica de Twitter OAuth
    this.showMessage('info', 'Twitter Login', 'Funcionalidad en desarrollo');
  }



}
