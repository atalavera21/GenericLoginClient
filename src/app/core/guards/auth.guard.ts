import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../auth/token.service';
import { inject } from '@angular/core';
import { SessionService } from '../auth/session.service';

/**
 * 🛡️ AuthGuard
 * Guard funcional para proteger rutas que requieren autenticación
 * Valida token, datos de usuario y redirige a login si es necesario
 *
 * Guard básico para proteger cualquier ruta que requiera estar logueado
 * USO: Aplicar a rutas que necesitan usuario autenticado (sin importar rol)
 *
 */
export const authGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  console.log('🔐 AuthGuard: Verificando autenticación...');

  if (!sessionService.hasValidSession()) {
    console.log('❌ Sesión inválida - Redirigiendo a login');
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  console.log('✅ Usuario autenticado correctamente');
  return true;

  return true;
};

/**
 * 🎭 RoleGuard
 * Guard para proteger rutas por rol específico usando route.data
 * USO: Cuando se necesita un rol específico definido en route.data['requiredRole']
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const requiredRole = route.data?.['requiredRole'] as string;

  if (!requiredRole) {
    console.error('❌ RoleGuard: Falta requiredRole en route.data');
    return false;
  }

  console.log(`🎭 RoleGuard: Verificando rol "${requiredRole}"`);

  // Verificar autenticación primero
  if (!sessionService.hasValidSession()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Verificar rol específico
  if (!sessionService.hasRole(requiredRole)) {
    const sessionInfo = sessionService.getSessionInfo();
    console.log(
      `❌ Sin rol "${requiredRole}" - Tiene: [${sessionInfo.roles.join(', ')}]`
    );
    router.navigate(['/unauthorized']);
    return false;
  }

  console.log(`✅ Acceso concedido para rol "${requiredRole}"`);
  return true;
};

/**
 * 👨‍💼 AdminGuard
 * Guard específico para rutas exclusivas de administradores
 * USO: Aplicar directamente a rutas /admin sin necesidad de route.data
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  console.log('👨‍💼 AdminGuard: Verificando acceso admin');

  if (!sessionService.hasValidSession()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  if (!sessionService.hasRole('Admin')) {
    console.log('❌ Acceso denegado: Requiere rol Admin');
    router.navigate(['/unauthorized']);
    return false;
  }

  console.log('✅ Acceso admin concedido');
  return true;
};

/**
 * 👤 UserGuard
 * Guard específico para rutas exclusivas de usuarios regulares
 * USO: Aplicar directamente a rutas /user sin necesidad de route.data
 */
export const userGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  console.log('👤 UserGuard: Verificando acceso usuario');

  if (!sessionService.hasValidSession()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  if (!sessionService.hasRole('Usuario')) {
    console.log('❌ Acceso denegado: Requiere rol Usuario');
    router.navigate(['/unauthorized']);
    return false;
  }

  console.log('✅ Acceso usuario concedido');
  return true;
};

/**
 * 👻 GuestGuard
 * Guard para rutas que solo deben ser accesibles cuando NO estás logueado
 * USO: Aplicar a /auth/login, /auth/register para evitar acceso si ya está logueado
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  console.log('👻 GuestGuard: Verificando usuario no autenticado');

  if (sessionService.hasValidSession()) {
    console.log('⚠️ Usuario ya autenticado - Redirigiendo a dashboard');
    const dashboardRoute = sessionService.getDashboardRoute();
    router.navigate([dashboardRoute]);
    return false;
  }

  console.log('✅ Usuario no autenticado - Acceso permitido');
  return true;
};
