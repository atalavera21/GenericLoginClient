import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    title: 'Registro de Usuario'
  },
  {
    path: 'confirm-email',
    loadComponent: () => import('./confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent),
    title: 'Confirmación de Correo'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  }
];