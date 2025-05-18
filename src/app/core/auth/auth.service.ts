import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, RegisterUserRequest } from '../models/auth/user.model';
import { Observable } from 'rxjs';
import { ConfirmEmailResponse } from '../models/auth/confirm-email-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  register(registerData: RegisterUserRequest) : Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/registrar`, registerData);
  }

  confirmarEmail(userId: string, token: string): Observable<any> {        
    return this.http.get(`${this.apiUrl}/Auth/confirmar-email?userId=${userId}&token=${token}`);
  }


}
