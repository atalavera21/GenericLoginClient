import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { adminGuard, authGuard, guestGuard, userGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
     canActivate: [guestGuard], // 👻 Solo si NO está logueado
    loadChildren: () => import('./features/auth/auth.routes').then(routes => routes.authRoutes)

  },
  {
    path: 'admin',
     canActivate: [adminGuard], // 👨‍💼 Solo usuarios con rol 'Admin'
    loadChildren: () => import('./features/admin/admin.routes').then(routes => routes.ADMIN_ROUTES)
  },
  {
    path: 'user', 
    canActivate: [userGuard], // 👤 Solo usuarios con rol 'Usuario'
    loadChildren: () => import('./features/user/user.routes').then(routes => routes.USER_ROUTES)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/Pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: ''
  },

  // ============================================
  // RUTAS ADICIONALES PROTEGIDAS (Opcional)
  // ============================================
  {
    path: 'profile',
    canActivate: [authGuard], // 🔐 Cualquier usuario autenticado
    // loadComponent: () => import('./shared/components/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard], // 🔐 Cualquier usuario autenticado  
    // loadComponent: () => import('./shared/components/settings/settings.component').then(m => m.SettingsComponent)
  },
];