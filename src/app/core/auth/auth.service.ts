import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthResponse, RegisterUserRequest } from '../models/auth/user.model';
import { BehaviorSubject, catchError, map, Observable, of, throwError, timeout } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
} from '../models/auth/login-request.model';
import { Router } from '@angular/router';
import { AUTH } from '../../Utils/dictionary.types';
import { SessionService } from './session.service';
import { RoleService } from './role.service';


/**
 * 🔐 AuthService
 * 
 * Servicio de autenticación que proporciona:
 * - Inicio y cierre de sesión de usuarios
 * - Registro de nuevos usuarios
 * - Recuperación y restablecimiento de contraseñas
 * - Confirmación de email
 * - Verificación de estado de autenticación
 * - Gestión de roles y permisos de usuario
 * - Redirección automática según el perfil del usuario
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  // Estado reactivo para roles (para componentes que lo necesiten)
  private userRolesSubject = new BehaviorSubject<string[]>([]);
  public userRoles$ = this.userRolesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private sessionService: SessionService,
    private roleService: RoleService
  ) {
    this.initializeUserState();
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  /**
   * Inicializa el estado del usuario al cargar la aplicación
   */
  private initializeUserState(): void {
    if (this.sessionService.initializeSession()) {
      const sessionInfo = this.sessionService.getSessionInfo();
      this.userRolesSubject.next(sessionInfo.roles);
    }
  }

  // ============================================
  // AUTENTICACIÓN HTTP
  // ============================================

  /**
   * Realiza login del usuario
   * @param loginData Credenciales de login
   * @returns Observable con respuesta del servidor
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, loginData).pipe(
      map(response => {
        if (response.success) {
          this.handleSuccessfulLogin(response, loginData.rememberMe);
        }
        return response;
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Registra un nuevo usuario
   * @param registerData Datos de registro
   * @returns Observable con respuesta del servidor
   */
  register(registerData: RegisterUserRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/registrar`, registerData).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Confirma email del usuario
   * @param userId ID del usuario
   * @param token Token de confirmación
   * @returns Observable con respuesta del servidor
   */
  confirmarEmail(userId: string, token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/Auth/confirmar-email?userId=${userId}&token=${token}`).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Solicita recuperación de contraseña
   * @param email Email del usuario
   * @returns Observable con respuesta del servidor
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/forgot-password`, { email }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Restablece contraseña con token
   * @param token Token de restablecimiento
   * @param newPassword Nueva contraseña
   * @returns Observable con respuesta del servidor
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/reset-password`, { 
      token, 
      newPassword 
    }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  // ============================================
  // GESTIÓN DE SESIÓN
  // ============================================

  /**
   * Maneja login exitoso: guarda sesión y redirige
   * @param response Respuesta exitosa del servidor
   * @param rememberMe Preferencia de persistencia
   */
  private handleSuccessfulLogin(response: LoginResponse, rememberMe: boolean): void {
    // Extraer roles (maneja diferentes estructuras de respuesta)
    const userRoles = response.rol?.data?.roles || response.rol?.roles || [];
    
    const userData = {
      userId: response.userId,
      email: response.email,
      nombres: response.nombres,
      apellidos: response.apellidos,
      roles: userRoles
    };

    // Guardar sesión completa
    this.sessionService.saveSession(response.token, userData, rememberMe);
    
    // Actualizar estado reactivo
    this.userRolesSubject.next(userRoles);

    console.log('✅ Login exitoso:', {
      user: `${response.nombres} ${response.apellidos}`,
      roles: userRoles,
      rememberMe
    });

    // Redirigir automáticamente después de un delay
    setTimeout(() => {
      this.redirectToDashboard();
    }, 1500);
  }

  /**
   * Redirige al dashboard apropiado según el rol del usuario
   */
  redirectToDashboard(): void {
    const dashboardRoute = this.sessionService.getDashboardRoute();
    console.log(`➡️ Redirigiendo a: ${dashboardRoute}`);
    this.router.navigate([dashboardRoute]);
  }

  /**
   * Redirige basado en roles específicos (método legacy para compatibilidad)
   * @param roles Array de roles del usuario
   */
  redirectBasedOnUserRoles(roles: string[]): void {
    if (!roles || roles.length === 0) {
      console.log('⚠️ No hay roles, redirigiendo a home');
      this.router.navigate(['/']);
      return;
    }

    // Usar RoleService para determinar el rol principal
    const primaryRole = this.roleService.getPrimaryRole();
    
    switch (primaryRole) {
      case this.roleService.ROLES.ADMIN:
        console.log('➡️ Redirigiendo a admin dashboard');
        this.router.navigate(['/admin']);
        break;
      case this.roleService.ROLES.USER:
        console.log('➡️ Redirigiendo a user dashboard');
        this.router.navigate(['/user']);
        break;
      case this.roleService.ROLES.MODERATOR:
        console.log('➡️ Redirigiendo a moderator dashboard');
        this.router.navigate(['/moderator']);
        break;
      default:
        console.log('⚠️ Rol no reconocido, redirigiendo a home');
        this.router.navigate(['/']);
        break;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================

  /**
   * Logout completo con llamada al servidor
   * @returns Observable para manejar en componente
   */
  logoutFromServer(): Observable<any> {
    const sessionInfo = this.sessionService.getSessionInfo();
    
    if (!sessionInfo.token) {
      return of({ message: 'No hay token para invalidar' });
    }

    const headers = {
      Authorization: `Bearer ${sessionInfo.token}`,
      'Content-Type': 'application/json',
    };

    return this.http.post(`${this.apiUrl}/Auth/logout`, {}, { headers }).pipe(
      timeout(10000),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al cerrar sesión en el servidor:', error);
        return of({
          error: true,
          message: 'Error del servidor, pero sesión cerrada localmente',
          details: error.message,
        });
      })
    );
  }

  /**
   * Logout simple (limpia datos locales y redirige)
   */
  logout(): void {
    console.log('🚪 Cerrando sesión...');
    this.cleanupAndRedirect();
  }

  /**
   * Logout de emergencia (sin comunicación con servidor)
   */
  emergencyLogout(): void {
    console.warn('🔥 Ejecutando logout de emergencia');
    this.cleanupAndRedirect({ emergency: 'true' });
  }

  /**
   * Limpia datos y redirige al login
   * @param queryParams Parámetros adicionales para la URL
   */
  private cleanupAndRedirect(queryParams?: any): void {
    this.sessionService.clearSession();
    this.userRolesSubject.next([]);
    
    this.router.navigate(['/auth/login'], {
      queryParams: queryParams || {
        logout: 'true',
        timestamp: Date.now(),
      },
    });
  }

  // ============================================
  // MÉTODOS DE VERIFICACIÓN (Para componentes)
  // ============================================

  /**
   * Verifica si el usuario está autenticado
   * @returns true si tiene sesión válida
   */
  isAuthenticated(): boolean {
    return this.sessionService.hasValidSession();
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role Rol a verificar
   * @returns true si tiene el rol
   */
  hasRole(role: string): boolean {
    return this.sessionService.hasRole(role);
  }

  /**
   * Verifica si el usuario tiene alguno de los roles
   * @param roles Array de roles a verificar
   * @returns true si tiene al menos uno
   */
  hasAnyRole(roles: string[]): boolean {
    return this.sessionService.hasAnyRole(roles);
  }

  /**
   * Obtiene los datos del usuario actual
   * @returns Datos del usuario o null
   */
  getCurrentUser(): any {
    const sessionInfo = this.sessionService.getSessionInfo();
    return sessionInfo.userData;
  }

  /**
   * Obtiene información del usuario actual
   * @returns Información básica del usuario
   */
  getCurrentUserInfo(): any {
    const sessionInfo = this.sessionService.getSessionInfo();
    return sessionInfo.userInfo;
  }

  /**
   * Obtiene los roles del usuario actual
   * @returns Array de roles
   */
  getUserRoles(): string[] {
    const sessionInfo = this.sessionService.getSessionInfo();
    return sessionInfo.roles;
  }

  /**
   * Obtiene el rol principal del usuario
   * @returns Rol principal o null
   */
  getPrimaryRole(): string | null {
    return this.sessionService.getPrimaryRole();
  }

  /**
   * Obtiene mensaje de bienvenida personalizado
   * @returns Mensaje de bienvenida
   */
  getWelcomeMessage(): string {
    return this.sessionService.getWelcomeMessage();
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Verifica si la sesión está próxima a expirar
   * @param minutes Minutos antes de expiración
   * @returns true si está próxima a expirar
   */
  isSessionNearExpiry(minutes: number = 5): boolean {
    return this.sessionService.isSessionNearExpiry(minutes);
  }

  /**
   * Obtiene información completa de la sesión
   * @returns Información detallada de la sesión
   */
  getSessionInfo(): any {
    return this.sessionService.getSessionInfo();
  }

  /**
   * Obtiene estado de la sesión para debugging
   * @returns Estado detallado
   */
  getSessionStatus(): any {
    return this.sessionService.getSessionStatus();
  }

  /**
   * Actualiza los datos del usuario en la sesión actual
   * @param userData Nuevos datos del usuario
   */
  updateUserData(userData: any): void {
    this.sessionService.refreshUserData(userData);
    
    // Actualizar roles si cambiaron
    if (userData.roles) {
      this.userRolesSubject.next(userData.roles);
    }
  }

  // ============================================
  // MANEJO DE ERRORES
  // ============================================

  /**
   * Maneja errores de autenticación de forma centralizada
   * @param error Error HTTP recibido
   * @returns Observable con error procesado
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ Error de autenticación:', error);
    
    // Si es error 401, hacer logout automático
    if (error.status === 401) {
      console.log('🔒 Token inválido, cerrando sesión automáticamente');
      this.emergencyLogout();
    }
    
    // Re-lanzar el error para que el componente pueda manejarlo
    return throwError(() => error);
  }

  // ============================================
  // MÉTODOS PARA COMPATIBILIDAD
  // ============================================

  /**
   * Setter para roles (para compatibilidad con código existente)
   * @param roles Array de roles
   */
  setUserRoles(roles: string[]): void {
    this.userRolesSubject.next(roles);
  }


}
