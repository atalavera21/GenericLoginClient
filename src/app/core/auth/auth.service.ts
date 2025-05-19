import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, RegisterUserRequest } from '../models/auth/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfirmEmailResponse } from '../models/auth/confirm-email-response.model';
import { LoginRequest, LoginResponse } from '../models/auth/login-request.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private userRoleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  public userRole$ = this.userRoleSubject.asObservable();


  constructor(
      private http: HttpClient,
      private router: Router) { }

  login(loginData: LoginRequest) : Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, loginData);
  }

  register(registerData: RegisterUserRequest) : Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/registrar`, registerData);
  }

  confirmarEmail(userId: string, token: string): Observable<any> {        
    return this.http.get(`${this.apiUrl}/Auth/confirmar-email?userId=${userId}&token=${token}`);
  }

  
  // Método para almacenar el rol del usuario al iniciar sesión
  setUserRole(role: string): void {
    if (this.isLocalStorage()) {
      localStorage.setItem('user_role', role);
    } else {
      sessionStorage.setItem('user_role', role);
    }
    this.userRoleSubject.next(role);
  }

  // Método para obtener el rol actual del usuario
  getUserRole(): string | null {
    return this.isLocalStorage() 
      ? localStorage.getItem('user_role') 
      : sessionStorage.getItem('user_role');
  }

  // Método para redirigir según el rol
  redirectBasedOnRole(): void {
    const role = this.getUserRole();
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'user') {
      this.router.navigate(['/user/dashboard']);
    } else {
      // Si no hay rol o no es reconocido, redirigir a una ruta por defecto
      this.router.navigate(['/']);
    }
  }

  // Verificar si se está usando localStorage (recordarme activado)
  isLocalStorage(): boolean {
    return localStorage.getItem('auth_token') !== null;
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.isLocalStorage() 
      ? localStorage.getItem('auth_token') 
      : sessionStorage.getItem('auth_token');
    return !!token;
  }

  // Método para cerrar sesión
  logout(): void {
    if (this.isLocalStorage()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_role');
    } else {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('user_role');
    }
    this.userRoleSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

}
