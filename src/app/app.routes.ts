import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(routes => routes.authRoutes)
    // No necesita guard - son rutas públicas (login, registro)
  },
  {
    path: 'admin',
    canActivate: [authGuard], // 🔒 Protegida - requiere autenticación
    loadChildren: () => import('./features/admin/admin.routes').then(routes => routes.ADMIN_ROUTES)
  },
  {
    path: 'user', 
    canActivate: [authGuard], // 🔒 Protegida - requiere autenticación
    loadChildren: () => import('./features/user/user.routes').then(routes => routes.USER_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];