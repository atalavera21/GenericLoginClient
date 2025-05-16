import { tokenInterceptor } from './../../../interceptors/token.interceptor';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ConfirmEmailResponse } from '../../../core/models/confirm-email-response.model';

@Component({
  selector: 'app-confirm-email',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent implements OnInit {

  loading = true;
  success = false;
  mensaje = '';
  errors: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
   
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      const token = params['token'];


      if(userId && token) {
        this.confirmarEmail(userId, token);
      }else{
        this.loading = false;
        this.success = false;
        this.mensaje = 'Enlace de confirmación inválido';
      }

    })
  }

  confirmarEmail(userId: string, token: string): void {
    this.loading = true; // Asegúrate de mostrar el loader mientras se procesa
  
    this.authService.confirmarEmail(userId, token)
      .subscribe({
        next: (response: ConfirmEmailResponse) => {
          this.loading = false;
          
          // Manejo de la respuesta exitosa
          this.success = response.success;
          this.mensaje = response.mensaje || 'Email confirmado exitosamente';
          
          // Si hay errores en la respuesta a pesar de success=true (caso poco común)
          if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
            this.errors = response.errors;
          } else {
            this.errors = [];
          }
        },
        error: (error) => {
          this.loading = false;
          this.success = false;
          
          // Extraer información del error
          if (error.error) {
            // Si el backend devuelve un mensaje específico
            if (error.error.mensaje) {
              this.mensaje = error.error.mensaje;
            } else if (error.error.message) {
              this.mensaje = error.error.message;
            } else {
              this.mensaje = 'Error al confirmar el email';
            }
            
            // Si el backend devuelve errores específicos
            if (error.error.errors && Array.isArray(error.error.errors)) {
              this.errors = error.error.errors;
            } else if (typeof error.error === 'string') {
              // Si el error es una cadena simple
              this.errors = [error.error];
            } else {
              this.errors = ['No se pudo confirmar el email. Por favor, intenta nuevamente.'];
            }
          } else if (error.status === 0) {
            // Error de conexión
            this.mensaje = 'No se pudo conectar con el servidor';
            this.errors = ['Verifica tu conexión a internet o intenta más tarde.'];
          } else {
            // Otros errores HTTP
            this.mensaje = `Error ${error.status}: ${error.statusText || 'Error al confirmar el email'}`;
            this.errors = ['Ocurrió un problema al procesar tu solicitud.'];
          }
        },
        complete: () => {
          // Asegúrate de que el loading se detenga cuando termine
          this.loading = false;
        }
      });
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

}
