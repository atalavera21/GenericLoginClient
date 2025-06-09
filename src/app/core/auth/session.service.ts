import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { UserDataService } from './userdata.service';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(
    private tokenService: TokenService,
    private userDataService: UserDataService,
    private roleService: RoleService
  ) {}

  /**
   * Verifica si hay una sesión completa y válida
   * @returns true si token y datos de usuario son válidos
   */
  hasValidSession(): boolean {
    return (
      this.tokenService.hasValidToken() &&
      this.userDataService.hasValidUserData()
    );
  }

  /**
   * Guarda una sesión completa (token + datos de usuario)
   * @param token Token de autenticación JWT
   * @param userData Datos completos del usuario
   * @param rememberMe Preferencia de storage persistente
   */
  saveSession(token: string, userData: any, rememberMe: boolean): void {
    this.tokenService.saveToken(token, rememberMe);
    this.userDataService.saveUserData(userData, rememberMe);
  }

  /**
   * Limpia completamente la sesión (token + datos)
   */
  clearSession(): void {
    this.tokenService.removeToken();
    this.userDataService.removeUserData();
  }

  /**
   * Obtiene información completa de la sesión actual
   * @returns Objeto con toda la información de sesión
   */
  getSessionInfo(): {
    token: string | null;
    tokenInfo: any;
    userData: any;
    userInfo: any;
    roles: string[];
    roleInfo: any;
    isValid: boolean;
    isRemembered: boolean;
  } {
    const token = this.tokenService.getToken();
    const userData = this.userDataService.getUserData();

    return {
      token,
      tokenInfo: this.tokenService.getTokenInfo(),
      userData,
      userInfo: this.userDataService.getUserInfo(),
      roles: this.roleService.getUserRoles(),
      roleInfo: this.roleService.getRoleInfo(),
      isValid: this.hasValidSession(),
      isRemembered: !!localStorage.getItem('auth_token'),
    };
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   * @param role Rol a verificar
   * @returns true si tiene el rol
   */
  hasRole(role: string): boolean {
    if (!this.hasValidSession()) return false;
    return this.roleService.hasRole(role);
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param roles Array de roles a verificar
   * @returns true si tiene al menos uno de los roles
   */
  hasAnyRole(roles: string[]): boolean {
    if (!this.hasValidSession()) return false;
    return this.roleService.hasAnyRole(roles);
  }

  /**
   * Obtiene el rol principal del usuario actual
   * @returns Rol principal o null
   */
  getPrimaryRole(): string | null {
    if (!this.hasValidSession()) return null;
    return this.roleService.getPrimaryRole();
  }

  /**
   * Determina la ruta de dashboard apropiada según el rol
   * @returns Ruta del dashboard
   */
  getDashboardRoute(): string {
    if (!this.hasValidSession()) return '/auth/login';
    return this.roleService.getDashboardRoute();
  }

  /**
   * Obtiene mensaje de bienvenida personalizado
   * @returns Mensaje de bienvenida
   */
  getWelcomeMessage(): string {
    if (!this.hasValidSession()) return 'Sesión no válida';
    return this.roleService.getWelcomeMessage();
  }

  /**
   * Verifica si puede acceder a una ruta específica
   * @param route Ruta a verificar
   * @param requiredRoles Roles requeridos
   * @returns true si puede acceder
   */
  canAccessRoute(route: string, requiredRoles: string[] = []): boolean {
    if (!this.hasValidSession()) return false;
    return this.roleService.canAccessRoute(route, requiredRoles);
  }

  /**
   * Obtiene información de estado de la sesión para debugging
   * @returns Estado detallado de la sesión
   */
  getSessionStatus(): {
    hasToken: boolean;
    tokenValid: boolean;
    hasUserData: boolean;
    userDataValid: boolean;
    sessionValid: boolean;
    roles: string[];
    primaryRole: string | null;
    expiresAt: Date | null;
  } {
    const token = this.tokenService.getToken();
    const tokenInfo = this.tokenService.getTokenInfo();
    const userData = this.userDataService.getUserData();

    return {
      hasToken: !!token,
      tokenValid: !!token && this.tokenService.isTokenValid(token),
      hasUserData: !!userData,
      userDataValid: this.userDataService.hasValidUserData(),
      sessionValid: this.hasValidSession(),
      roles: this.roleService.getUserRoles(),
      primaryRole: this.roleService.getPrimaryRole(),
      expiresAt: tokenInfo?.expiresAt || null,
    };
  }

  /**
   * Inicializa el estado de sesión al arrancar la aplicación
   * @returns true si se encontró una sesión válida
   */
  initializeSession(): boolean {
    const isValid = this.hasValidSession();

    if (isValid) {
      const sessionInfo = this.getSessionInfo();
      console.log('✅ Sesión válida encontrada:', {
        user: sessionInfo.userInfo?.fullName,
        roles: sessionInfo.roles,
        primaryRole: sessionInfo.roleInfo?.primaryRole,
        expiresAt: sessionInfo.tokenInfo?.expiresAt,
      });
    } else {
      console.log('ℹ️ No se encontró sesión válida');
    }

    return isValid;
  }

  /**
   * Renueva los datos de usuario manteniendo el token
   * @param newUserData Nuevos datos de usuario
   */
  refreshUserData(newUserData: any): void {
    if (!this.hasValidSession()) return;

    const isRemembered = !!localStorage.getItem('user_data');
    this.userDataService.saveUserData(newUserData, isRemembered);
  }

  /**
   * Verifica si la sesión está próxima a expirar
   * @param minutesBeforeExpiry Minutos antes de expiración para considerar "próximo"
   * @returns true si está próximo a expirar
   */
  isSessionNearExpiry(minutesBeforeExpiry: number = 5): boolean {
    const tokenInfo = this.tokenService.getTokenInfo();
    if (!tokenInfo?.expiresAt) return false;

    const now = new Date();
    const expiryTime = new Date(tokenInfo.expiresAt);
    const timeDiff = expiryTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff <= minutesBeforeExpiry && minutesDiff > 0;
  }
}
