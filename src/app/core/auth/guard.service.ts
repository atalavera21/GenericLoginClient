import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, take } from 'rxjs';
import { UserData } from '../models/guards/user-data.model';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class GuardService {
  
  private redirectUrl: string = '';
  private currentUserSubject: BehaviorSubject<UserData | null> = new BehaviorSubject<UserData | null>(null);
  public currentUser$: Observable<UserData | null> = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.initializeUserState();
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  private initializeUserState(): void {
    const userData = this.getUserDataFromStorage();
    const token = this.getAuthToken();
    
    if (userData && token) {
      this.currentUserSubject.next(userData);
    }
  }

  // ============================================
  // MÉTODOS PARA GUARDS
  // ============================================

  public isAuthenticated(): Observable<boolean> {
    const token = this.getAuthToken();
    const userData = this.getUserDataFromStorage();
    return of(!!(token && userData));
  }

  public getCurrentUser(): Observable<UserData | null> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      const userData = this.getUserDataFromStorage();
      const token = this.getAuthToken();
      if (userData && token) {
        this.currentUserSubject.next(userData);
      }
    }
    return this.currentUser$;
  }

  public hasRole(role: string): Observable<boolean> {
    return this.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user || !user.roles) return false;
        return user.roles.includes(role);
      })
    );
  }

  public hasAnyRole(roles: string[]): Observable<boolean> {
    return this.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles.includes(role));
      })
    );
  }

  // ============================================
  // GESTIÓN DE REDIRECCIÓN
  // ============================================

  public setRedirectUrl(url: string): void {
    const excludedUrls = ['/auth/login', '/auth/register', '/logout'];
    if (!excludedUrls.includes(url)) {
      this.redirectUrl = url;
    }
  }

  public getAndClearRedirectUrl(): string {
    const url = this.redirectUrl;
    this.redirectUrl = '';
    return url;
  }

  public redirectToUserArea(roles: string[]): void {
    if (roles.includes('Admin')) {
      this.router.navigate(['/admin']);
    } else if (roles.includes('Moderator')) {
      this.router.navigate(['/moderator']);
    } else {
      this.router.navigate(['/user']);
    }
  }

  // ============================================
  // MÉTODOS PARA AuthService
  // ============================================

  public setCurrentUser(userData: UserData | null): void {
    this.currentUserSubject.next(userData);
  }

  public clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    this.redirectUrl = '';
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private getUserDataFromStorage(): UserData | null {
    try {
      const userDataStr = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      if (!userDataStr) return null;
      
      const userData = JSON.parse(userDataStr);
      
      if (userData && userData.userId && userData.email && userData.roles) {
        return userData as UserData;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      return null;
    }
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  public isAdmin(): Observable<boolean> {
    return this.hasRole('Admin');
  }

  public isModerator(): Observable<boolean> {
    return this.hasRole('Moderator');
  }

  public isUser(): Observable<boolean> {
    return this.hasRole('User');
  }
}