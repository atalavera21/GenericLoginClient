import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, take } from 'rxjs';
import { GuardService } from '../auth/guard.service';


// ============================================
// AUTH GUARD - Actualizado con GuardService
// ============================================

/**
 * Guard que protege rutas requiriendo autenticación
 * Redirige al login si el usuario no está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const guardService = inject(GuardService);
  const router = inject(Router);

  return guardService.isAuthenticated().pipe(
    take(1),
    map(isAuth => {
      if (isAuth) {
        return true;
      } else {
        guardService.setRedirectUrl(state.url);
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};


// ============================================
// ROLE GUARD - Actualizado con GuardService
// ============================================

/**
 * Guard que protege rutas basándose en roles específicos
 */
export const roleGuard = (allowedRoles: string | string[]): CanActivateFn => {
  return (route, state) => {
    const guardService = inject(GuardService);
    const router = inject(Router);

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return guardService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user) {
          guardService.setRedirectUrl(state.url);
          router.navigate(['/auth/login']);
          return false;
        }

        const hasPermission = roles.some(role => user.roles.includes(role));

        if (hasPermission) {
          return true;
        } else {
          // Redirigir al área correcta según su rol
          guardService.redirectToUserArea(user.roles);
          return false;
        }
      })
    );
  };
};


// ============================================
// GUEST GUARD - Actualizado con GuardService
// ============================================

/**
 * Guard para rutas que solo deben ser accesibles para usuarios NO autenticados
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const guardService = inject(GuardService);

  return guardService.getCurrentUser().pipe(
    take(1),
    map(user => {
      if (!user) {
        return true; // No está autenticado, puede acceder
      } else {
        // Ya está autenticado, redirigir según su rol
        guardService.redirectToUserArea(user.roles);
        return false;
      }
    })
  );
};


// ============================================
// GUARDS ESPECÍFICOS ADICIONALES
// ============================================

/**
 * Guard específico para administradores
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const guardService = inject(GuardService);
  const router = inject(Router);

  return guardService.isAdmin().pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      } else {
        guardService.setRedirectUrl(state.url);
        router.navigate(['/unauthorized']);
        return false;
      }
    })
  );
};

/**
 * Guard específico para moderadores y administradores
 */
export const moderatorGuard: CanActivateFn = (route, state) => {
  const guardService = inject(GuardService);
  const router = inject(Router);

  return guardService.hasAnyRole(['Admin', 'Moderator']).pipe(
    take(1),
    map(hasRole => {
      if (hasRole) {
        return true;
      } else {
        guardService.setRedirectUrl(state.url);
        router.navigate(['/unauthorized']);
        return false;
      }
    })
  );
};
