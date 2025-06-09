import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      main {
        min-height: calc(100vh - 80px);
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'auth-app';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('🚀 Aplicación iniciada');

    // Verificar si el usuario ya está autenticado al cargar la aplicación
    if (this.authService.isAuthenticated()) {
      const userInfo = this.authService.getCurrentUserInfo();
      const primaryRole = this.authService.getPrimaryRole();

      console.log('✅ Usuario ya autenticado:', userInfo?.fullName);
      console.log('🎭 Rol principal:', primaryRole);

      // Redirigir al dashboard apropiado según el rol del usuario
      this.redirectToUserDashboard(primaryRole);
    } else {
      console.log('ℹ️ Usuario no autenticado');
      // Opcional: Redirigir a página de inicio o login
      // this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Redirige al usuario a su dashboard apropiado según su rol principal
   * @param primaryRole Rol principal del usuario autenticado
   */
  private redirectToUserDashboard(primaryRole: string | null): void {
    // Solo redirigir si estamos en la ruta raíz para evitar interrumpir navegación
    if (this.router.url === '/' || this.router.url === '') {
      switch (primaryRole) {
        case 'Admin':
          console.log('➡️ Redirigiendo administrador a /admin');
          this.router.navigate(['/admin']);
          break;

        case 'Usuario':
          console.log('➡️ Redirigiendo usuario a /user');
          this.router.navigate(['/user']);
          break;

        case 'Moderator':
          console.log('➡️ Redirigiendo moderador a /moderator');
          this.router.navigate(['/moderator']);
          break;

        default:
          console.log('⚠️ Rol no reconocido o sin rol específico');
          // Mantener en la página actual o redirigir a dashboard genérico
          // this.router.navigate(['/dashboard']);
          break;
      }
    } else {
      console.log(
        'ℹ️ Usuario ya está navegando, no se redirige automáticamente'
      );
    }
  }

  /**
   * Método opcional para debugging del estado de autenticación
   * Puedes llamarlo desde la consola del navegador para verificar el estado
   */
  checkAuthStatus(): void {
    const status = {
      isAuthenticated: this.authService.isAuthenticated(),
      currentUser: this.authService.getCurrentUserInfo(),
      roles: this.authService.getUserRoles(),
      primaryRole: this.authService.getPrimaryRole(),
      sessionInfo: this.authService.getSessionStatus(),
    };

    console.table(status);
  }
}
