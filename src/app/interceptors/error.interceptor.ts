import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Autenticación fallida o token expirado
        localStorage.removeItem('auth_token');
        router.navigate(['/auth/login']);
      }
      
      return throwError(() => error);
    })
  );
};