import { Injectable } from '@angular/core';
import { UserDataService } from './userdata.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private userDataService: UserDataService) {}

  // Constantes de roles para evitar errores de tipeo
  readonly ROLES = {
    ADMIN: 'Admin',
    USER: 'Usuario',
    MODERATOR: 'Moderator',
  } as const;

  /**
   * Obtiene los roles del usuario actual
   * @returns Array de roles o array vacío si no hay usuario
   */
  getUserRoles(): string[] {
    const userData = this.userDataService.getUserData();
    return userData?.roles || [];
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role Rol a verificar
   * @returns true si tiene el rol, false en caso contrario
   */
  hasRole(role: string): boolean {
    const userRoles = this.getUserRoles();
    return userRoles.includes(role);
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param roles Array de roles a verificar
   * @returns true si tiene al menos uno de los roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param roles Array de roles requeridos
   * @returns true si tiene todos los roles
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.every((role) => userRoles.includes(role));
  }

  /**
   * Obtiene el rol principal según jerarquía definida
   * @returns Rol principal o null si no tiene roles
   */
  getPrimaryRole(): string | null {
    const roleHierarchy = [
      this.ROLES.ADMIN,
      this.ROLES.MODERATOR,
      this.ROLES.USER,
    ];
    const userRoles = this.getUserRoles();

    for (const role of roleHierarchy) {
      if (userRoles.includes(role)) {
        return role;
      }
    }

    return userRoles.length > 0 ? userRoles[0] : null;
  }

  /**
   * Verifica si el usuario es administrador
   * @returns true si tiene rol Admin
   */
  isAdmin(): boolean {
    return this.hasRole(this.ROLES.ADMIN);
  }

  /**
   * Verifica si el usuario es usuario regular
   * @returns true si tiene rol Usuario
   */
  isUser(): boolean {
    return this.hasRole(this.ROLES.USER);
  }

  /**
   * Verifica si el usuario es moderador
   * @returns true si tiene rol Moderator
   */
  isModerator(): boolean {
    return this.hasRole(this.ROLES.MODERATOR);
  }

  /**
   * Obtiene información detallada de roles
   * @returns Objeto con información de roles del usuario
   */
  getRoleInfo(): {
    roles: string[];
    primaryRole: string | null;
    isAdmin: boolean;
    isUser: boolean;
    isModerator: boolean;
    hasMultipleRoles: boolean;
  } {
    const roles = this.getUserRoles();

    return {
      roles,
      primaryRole: this.getPrimaryRole(),
      isAdmin: this.isAdmin(),
      isUser: this.isUser(),
      isModerator: this.isModerator(),
      hasMultipleRoles: roles.length > 1,
    };
  }

  /**
   * Determina la ruta de dashboard según el rol principal
   * @returns Ruta del dashboard apropiado
   */
  getDashboardRoute(): string {
    const primaryRole = this.getPrimaryRole();

    switch (primaryRole) {
      case this.ROLES.ADMIN:
        return '/admin';
      case this.ROLES.USER:
        return '/user';
      case this.ROLES.MODERATOR:
        return '/moderator';
      default:
        return '/dashboard'; // Ruta por defecto
    }
  }

  /**
   * Verifica si el usuario puede acceder a una ruta específica
   * @param route Ruta a verificar
   * @param requiredRoles Roles requeridos para la ruta
   * @returns true si puede acceder
   */
  canAccessRoute(route: string, requiredRoles: string[] = []): boolean {
    if (requiredRoles.length === 0) return true;
    return this.hasAnyRole(requiredRoles);
  }

  /**
   * Obtiene mensaje de bienvenida personalizado según rol
   * @returns Mensaje de bienvenida
   */
  getWelcomeMessage(): string {
    const userInfo = this.userDataService.getUserInfo();
    const primaryRole = this.getPrimaryRole();

    if (!userInfo) return 'Bienvenido';

    const roleMessages = {
      [this.ROLES.ADMIN]: 'Panel de Administración',
      [this.ROLES.USER]: 'Tu Dashboard Personal',
      [this.ROLES.MODERATOR]: 'Panel de Moderación',
    };

    const roleMessage = primaryRole && roleMessages[primaryRole as keyof typeof roleMessages] || 'Dashboard';

    return `Bienvenido, ${userInfo.nombres}! - ${roleMessage}`;
  }
}
