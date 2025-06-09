import { Injectable } from '@angular/core';

/**
 * 👤 UserDataService  
 * Responsabilidad: Gestión de datos de usuario en storage
 */
@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor() { }


  /**
   * Obtiene los datos del usuario del storage con validación
   * @returns Datos del usuario o null si no existen o son inválidos
  */
  getUserData(): any {
    try {
      const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      if (!userData) return null;
      
      const parsed = JSON.parse(userData);
      
      // Validación de estructura mínima requerida
      if (parsed?.userId && parsed?.email && Array.isArray(parsed?.roles)) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Guarda los datos del usuario en storage
   * @param userData Datos del usuario a guardar
   * @param rememberMe Usar localStorage (true) o sessionStorage (false)
   */
  saveUserData(userData: any, rememberMe: boolean): void {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Elimina los datos del usuario del storage
  */
  removeUserData(): void {
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('user_data');
  }

  /**
   * Verifica si existen datos válidos de usuario
   * @returns true si hay datos válidos de usuario
   */
  hasValidUserData(): boolean {
    return !!this.getUserData();
  }

  /**
   * Obtiene información específica del usuario
   * @returns Información básica del usuario o null
   */
  getUserInfo(): { 
    userId: string; 
    email: string; 
    nombres: string; 
    apellidos: string; 
    fullName: string;
  } | null {
    const userData = this.getUserData();
    if (!userData) return null;

    return {
      userId: userData.userId,
      email: userData.email,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      fullName: `${userData.nombres} ${userData.apellidos}`
    };
  }

  /**
   * Verifica si el usuario tiene datos completos
   * @returns true si todos los campos requeridos están presentes
   */
  hasCompleteUserData(): boolean {
    const userData = this.getUserData();
    if (!userData) return false;

    const requiredFields = ['userId', 'email', 'nombres', 'apellidos', 'roles'];
    return requiredFields.every(field => userData[field] !== undefined && userData[field] !== null);
  }

}
