import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/auth/auth.service';
import { GuardService } from './core/auth/guard.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
   imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 80px);
    }
  `]
})

export class AppComponent implements OnInit {
  title = 'auth-app';

  constructor(
    private authService: AuthService,
    private guardService: GuardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar el estado del usuario al cargar la aplicación
    this.initializeApp();
    
    // Opcional: Solo en desarrollo - logging de rutas
    if (!this.isProduction()) {
      this.setupRouteLogging();
    }
  }

  /**
   * Inicializa la aplicación verificando sesiones existentes
   */
  private initializeApp(): void {
    try {
      // Verificar si hay una sesión activa
      if (this.authService.hasActiveSession()) {
        console.log('✅ Sesión activa encontrada, inicializando usuario...');
        this.authService.initializeUserSession();
      } else {
        console.log('ℹ️ No hay sesión activa');
        // Limpiar cualquier dato residual silenciosamente
        this.authService.cleanLocalData();
      }
    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
      // En caso de error, limpiar todo por seguridad
      this.authService.cleanLocalData();
    }
  }

  /**
   * Verifica si estamos en producción
   */
  private isProduction(): boolean {
    // Puedes usar environment.production si tienes configurado environments
    return false; // Cambia a true en producción o usa environment.production
  }

  /**
   * Configura logging de rutas solo para desarrollo
   */
  private setupRouteLogging(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('🧭 Navegación a:', event.urlAfterRedirects);
        
        // Mostrar información del usuario actual en desarrollo
        this.guardService.getCurrentUser().subscribe(user => {
          if (user) {
            console.log('👤 Usuario actual:', {
              nombre: user.nombres,
              email: user.email,
              roles: user.roles
            });
          } else {
            console.log('👤 Usuario: No autenticado');
          }
        });
      });
  }
}