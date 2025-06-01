import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthResponse, RegisterUserRequest } from '../models/auth/user.model';
import { BehaviorSubject, catchError, map, Observable, of, timeout } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
} from '../models/auth/login-request.model';
import { Router } from '@angular/router';
import { AUTH } from '../../Utils/dictionary.types';
import { GuardService } from './guard.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userRolesSubject = new BehaviorSubject<string[]>([]);
  public userRoles$ = this.userRolesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private guardService: GuardService // Inyectar GuardService
  ) {}

  // ============================================
  // MÉTODOS DE AUTENTICACIÓN EXISTENTES
  // ============================================

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, loginData).pipe(
      map(response => {
        if (response.success) {
          // Extraer roles de la estructura correcta
          const userRoles = response.rol?.data?.roles || [];

          // Crear objeto de usuario para el GuardService
          const userData = {
            userId: response.userId,
            email: response.email,
            nombres: response.nombres,
            apellidos: response.apellidos,
            roles: userRoles
          };

          // Actualizar el GuardService con el usuario actual
          this.guardService.setCurrentUser(userData);
        }
        return response;
      })
    );
  }

  register(registerData: RegisterUserRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/Auth/registrar`,
      registerData
    );
  }

  confirmarEmail(userId: string, token: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/Auth/confirmar-email?userId=${userId}&token=${token}`
    );
  }
  

  // ============================================
  // VERIFICACIONES DE AUTENTICACIÓN
  // ============================================

  /**
   * Verifica si se está utilizando LocalStorage
   * @returns boolean
   */
  isLocalStorage(): boolean {
    return localStorage.getItem('auth_token') !== null;
  }

  /**
    * Método para verificar si el usuario está autenticado
  */
  isAuthenticated(): boolean {
    const token = this.isLocalStorage()
      ? localStorage.getItem('auth_token')
      : sessionStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Verifica si el usuario tiene una sesión activa
   * @returns boolean
   */
  hasActiveSession(): boolean {
    const token = this.getAuthToken();
    const userData = this.getUserData();
    return !!(token && userData);
  }
  
  /**
   * Obtiene los datos del usuario desde LocalStorage o SessionStorage
   * @returns any
   */
  private getUserData(): any {
    const userData =
      localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }



  // ============================================
  // GESTIÓN DE ROLES
  // ============================================

   /**
   * Obtener el token de autenticación (ahora público para GuardService)
   */
  public getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  /**
   * Establece los roles del usuario en LocalStorage o SessionStorage
   * @param roles Lista de roles del usuario
   */
  setUserRoles(roles: string[]): void {
    if (this.isLocalStorage()) {
      localStorage.setItem('user_roles', JSON.stringify(roles));
    } else {
      sessionStorage.setItem('user_roles', JSON.stringify(roles));
    }
    this.userRolesSubject.next(roles);
  }

  /**
   * Obtiene los roles del usuario desde LocalStorage o SessionStorage
   * @returns string[]
   */
  getUserRoles(): string[] {
    let roles: string[] = [];

    if (this.isLocalStorage()) {
      const storedRoles = localStorage.getItem('user_roles');
      if (storedRoles) {
        try {
          roles = JSON.parse(storedRoles);
        } catch (error) {
          console.error('Error parsing user roles from localStorage:', error);
          roles = [];
        }
      }
    } else {
      const storedRoles = sessionStorage.getItem('user_roles');
      if (storedRoles) {
        try {
          roles = JSON.parse(storedRoles);
        } catch (error) {
          console.error('Error parsing user roles from sessionStorage:', error);
          roles = [];
        }
      }
    }

    return Array.isArray(roles) ? roles : [];
  }

  /** 
   * Método para verificar si el usuario tiene un rol específico
   * @param role: El rol a verificar 
   */
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  /**
   * Método para verificar si el usuario tiene alguno de los roles requeridos
   * @param requiredRoles: Lista de roles requeridos
   */ 
  hasAnyRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  /**
   * Método para verificar si el usuario tiene todos los roles requeridos
   * @param requiredRoles: Lista de roles requeridos
   */
  getPrimaryRole(): string | null {
    const roleHierarchy = [
      AUTH.ROLES.ADMIN,
      AUTH.ROLES.MODERATOR,
      AUTH.ROLES.USER,
    ];
    const userRoles = this.getUserRoles();

    for (const hierarchyRole of roleHierarchy) {
      if (userRoles.includes(hierarchyRole)) {
        return hierarchyRole;
      }
    }
    return userRoles.length > 0 ? userRoles[0] : null;
  }



  // ============================================
  // REDIRECCIÓN BASADA EN ROLES
  // ============================================

  /**
   * Redirige al usuario según sus roles
   * @param roles Lista de roles del usuario
  */
  redirectBasedOnUserRoles(roles: string[]) {
    // Verificar que roles no esté vacío
    if (!roles || roles.length === 0) {
      console.log('⚠️ No hay roles, redirigiendo a dashboard por defecto');
      this.router.navigate(['/dashboard']);
      return;
    }

    // Verificar si hay una URL de redirección pendiente
    const redirectUrl = this.guardService.getAndClearRedirectUrl();
    if (redirectUrl) {
      console.log('➡️ Redirigiendo a URL pendiente:', redirectUrl);
      this.router.navigate([redirectUrl]);
      return;
    }

    // Definir jerarquía de roles (código existente)
    const roleHierarchy = [
      AUTH.ROLES.ADMIN,
      AUTH.ROLES.MODERATOR,
      AUTH.ROLES.USER,
    ];

    let primaryRole = null;
    for (const hierarchyRole of roleHierarchy) {
      if (roles.includes(hierarchyRole)) {
        primaryRole = hierarchyRole;
        break;
      }
    }

    // Redirigir según el rol principal (código existente)
    switch (primaryRole) {
      case AUTH.ROLES.ADMIN:
        console.log('➡️ Redirigiendo a admin dashboard');
        this.router.navigate(['/admin/dashboard']);
        break;
      case AUTH.ROLES.MODERATOR:
        console.log('➡️ Redirigiendo a moderator dashboard');
        this.router.navigate(['/moderator/dashboard']);
        break;
      case AUTH.ROLES.USER:
        console.log('➡️ Redirigiendo a user dashboard');
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        console.log('⚠️ Roles no reconocidos:', roles, 'redirigiendo a dashboard por defecto');
        this.router.navigate(['/dashboard']);
        break;
    }
  }


 
  // ============================================
  // SISTEMA DE LOGOUT
  // ============================================

  /**
   * Logout del servidor - Retorna Observable para manejar en componente
   */
  logoutFromServer(): Observable<any> {
    const token = this.getAuthToken();

    if (!token) {
      return of({ message: 'No hay token para invalidar' });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
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
   * Limpia todos los datos locales
   */
  cleanLocalData(): void {
    try {
      const localStorageKeys = [
        'auth_token',
        'user_data',
        'user_roles',
        'user_role',
        'refresh_token',
        'token_expiration',
      ];

      const sessionStorageKeys = [
        'auth_token',
        'user_data',
        'user_roles',
        'user_role',
        'refresh_token',
        'token_expiration',
      ];

      localStorageKeys.forEach((key) => localStorage.removeItem(key));
      sessionStorageKeys.forEach((key) => sessionStorage.removeItem(key));

      this.userRolesSubject.next([]);
      
      // Limpiar también el GuardService
      this.guardService.clearCurrentUser();
      
      console.log('Datos locales limpiados exitosamente');
    } catch (error) {
      console.error('Error al limpiar datos locales:', error);
    }
  }

  /**
   * Redirige al login
   */
  redirectToLogin(queryParams?: any): void {
    this.router.navigate(['/auth/login'], {
      queryParams: queryParams || {
        logout: 'true',
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Logout simple (solo limpia datos y redirige)
   */
  logout(): void {
    this.cleanLocalData();
    this.redirectToLogin();
  }

  /**
   * Logout de emergencia (sin servidor)
   */
  emergencyLogout(): void {
    console.warn('Ejecutando logout de emergencia');
    this.cleanLocalData();
    this.redirectToLogin({ emergency: 'true' });
  }



  // ============================================
  // MÉTODOS NUEVOS PARA INTEGRACIÓN
  // ============================================

  /**
   * Inicializar el estado del usuario al cargar la aplicación
   * Llamar desde app.component.ts o main.ts
   */
  public initializeUserSession(): void {
    if (this.isAuthenticated()) {
      const userData = this.getUserDataFromStorage();
      if (userData) {
        this.guardService.setCurrentUser(userData);
        this.setUserRoles(userData.roles || []);
      }
    }
  }

  /**
   * Obtener datos del usuario desde storage (ahora público)
   */
  public getUserDataFromStorage(): any {
    const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verificar si el usuario puede acceder a una ruta específica
   */
  public canAccessRoute(route: string, requiredRoles?: string[]): Observable<boolean> {
    if (!requiredRoles || requiredRoles.length === 0) {
      return this.guardService.isAuthenticated();
    }
    return this.guardService.hasAnyRole(requiredRoles);
  }


}
