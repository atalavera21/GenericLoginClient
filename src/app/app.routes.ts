import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(routes => routes.authRoutes)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(routes => routes.ADMIN_ROUTES)
  },
  {
    path: 'user',
    loadChildren: () => import('./features/user/user.routes').then(routes => routes.USER_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
