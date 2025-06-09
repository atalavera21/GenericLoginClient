import { Injectable } from '@angular/core';

/**
 * 🔐 TokenService
 * Servicio para gestión de tokens de autenticación y datos de usuario
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {

  constructor() {}


  /**
   * Recupera el token de autenticación del storage
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    return (
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    );
  }

  /**
   * Guarda el token en el storage apropiado
   * @param token Token JWT a guardar
   * @param rememberMe Usar localStorage (true) o sessionStorage (false)
   */
  saveToken(token: string, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('auth_token', token);
  }

  /**
   * Elimina el token del storage
   */
  removeToken(): void {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }

  /**
   * Valida si un token JWT no ha expirado
   * @param token Token JWT a validar
   * @returns true si es válido, false si expiró o es malformado
   */
  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  /**
   * Verifica si existe un token válido en storage
   * @returns true si hay token y es válido
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    return !!(token && this.isTokenValid(token));
  }

  /**
   * Decodifica el payload del token JWT sin validar expiración
   * @param token Token JWT a decodificar
   * @returns Payload del token o null si hay error
   */
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  /**
   * Obtiene información básica del token actual
   * @returns Información del token o null
   */
  getTokenInfo(): {
    isValid: boolean;
    payload: any;
    expiresAt: Date | null;
  } | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      isValid: this.isTokenValid(token),
      payload,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
    };
  }

}
