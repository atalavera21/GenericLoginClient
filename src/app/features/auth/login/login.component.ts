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
import { GuardService } from '../../../core/auth/guard.service';

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
    private guardService: GuardService,
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
    rememberMe: this.loginForm.get('rememberMe')?.value || false
  };

  this.loadingService.show();

  this.authService.login(loginData).subscribe({
    next: (response: LoginResponse) => {
      
      this.loadingService.hide();

      if (response.success) {

        // Extraer roles de la estructura correcta
        const userRoles = response.rol?.data?.roles || [];       

        //  Guardado de usuario
        const userData = {
          userId: response.userId,
          email: response.email,
          nombres: response.nombres,
          apellidos: response.apellidos,
          roles: userRoles 
        };      

        // Guardar el token en localStorage o sessionStorage según recordarme
        if (loginData.rememberMe) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('auth_token', response.token);
          sessionStorage.setItem('user_data', JSON.stringify(userData));
        }

        // ✅ Actualizar GuardService con el usuario actual
        this.guardService.setCurrentUser(userData);

        // Establecer los roles usando la variable correcta
        this.authService.setUserRoles(userRoles);
        
        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Inicio de sesión exitoso',
          detail: `Bienvenido, ${response.nombres}!`,
        });

        // Redirigir usando la variable con los roles correctos
        setTimeout(() => {
          this.authService.redirectBasedOnUserRoles(userRoles);
        }, 1500);

      } else {
        // Si la API devuelve success: false pero no es un error HTTP
        this.handleLoginErrors(response.errors || [response.mensaje]);
      }
    },
    error: (error) => {
      this.loadingService.hide();

      if (
        error.error &&
        error.error.errors &&
        error.error.errors.length > 0
      ) {
        // Solo mostrar los errores del array
        this.handleLoginErrors(error.error.errors);
      } else if (error.error && error.error.mensaje) {
        // Si no hay errores en el array, mostrar el mensaje general
        this.handleLoginErrors([error.error.mensaje]);
      } else {
        // Error genérico
        this.handleLoginErrors([
          'Ocurrió un error al iniciar sesión. Intenta nuevamente.',
        ]);
      }
    },
  });
}

  /**
   * ✅ Logout con confirmación
   */
  onLogout(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas cerrar sesión?',
      header: 'Confirmar cierre de sesión',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cerrar sesión',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.performLogout();
      },
      reject: () => {
        console.log('Cierre de sesión cancelado por el usuario');
      },
    });
  }

  /**
   * ✅ Logout rápido sin confirmación
   */
  onQuickLogout(): void {
    this.authService.logout();
    this.showMessage(
      'info',
      'Sesión cerrada',
      'Has cerrado sesión correctamente'
    );
  }

  /**
   * ✅ Logout de emergencia
   */
  onEmergencyLogout(): void {
    this.authService.emergencyLogout();
    this.showMessage(
      'warn',
      'Sesión cerrada',
      'Sesión cerrada por motivos de seguridad'
    );
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Maneja login exitoso
   */
  private handleSuccessfulLogin(
    response: LoginResponse,
    rememberMe: boolean
  ): void {
    const userData = {
      userId: response.userId,
      email: response.email,
      nombres: response.nombres,
      apellidos: response.apellidos,
      roles: response.rol?.roles || [],
    };

    // Guardar según "recordarme"
    if (rememberMe) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('auth_token', response.token);
      sessionStorage.setItem('user_data', JSON.stringify(userData));
    }

    this.authService.setUserRoles(response.rol?.roles || []);

    this.showMessage(
      'success',
      'Inicio de sesión exitoso',
      `Bienvenido, ${response.nombres}!`
    );

    setTimeout(() => {
      this.authService.redirectBasedOnUserRoles(response.rol?.roles || []);
    }, 1500);
  }

  /**
   * ✅ Ejecuta logout completo con llamada al servidor
   */
  private performLogout(): void {
    this.showMessage(
      'info',
      'Cerrando sesión...',
      'Por favor espera mientras procesamos tu solicitud'
    );

    this.authService.logoutFromServer().subscribe({
      next: (response) => {
        console.log('Logout exitoso del servidor:', response);
        this.showMessage(
          'success',
          'Sesión cerrada',
          'Sesión cerrada exitosamente'
        );
        this.authService.cleanLocalData();
        this.authService.redirectToLogin();
      },
      error: (error) => {
        console.error('Error en logout del servidor:', error);
        this.handleLogoutError(error);
        // Aún así, limpiar datos locales por seguridad
        this.authService.cleanLocalData();
        this.authService.redirectToLogin();
      },
    });
  }

  /**
   * Maneja errores de login
   */
  private handleLoginErrors(errors: string[]): void {
    errors.forEach((err: string) => {
      this.showMessage('error', 'Error de inicio de sesión', err);
    });
  }

  /**
   * Maneja errores HTTP
   */
  private handleHttpError(error: any): void {
    if (error.error?.errors?.length > 0) {
      this.handleLoginErrors(error.error.errors);
    } else if (error.error?.mensaje) {
      this.handleLoginErrors([error.error.mensaje]);
    } else {
      this.handleLoginErrors([
        'Ocurrió un error al iniciar sesión. Intenta nuevamente.',
      ]);
    }
  }

  /**
   * ✅ Maneja errores de logout
   */
  private handleLogoutError(error: any): void {
    let errorMessage = 'Error al cerrar sesión en el servidor';

    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.showMessage(
      'warn',
      'Advertencia',
      `${errorMessage}. Tu sesión local ha sido cerrada por seguridad.`
    );
  }

  /**
   * ✅ Método helper para mostrar mensajes
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
  // SOCIAL LOGIN
  // ============================================

  /**
   * Métodos para iniciar sesión con proveedores externos
   */

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
