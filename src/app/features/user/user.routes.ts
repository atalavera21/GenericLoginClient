import { Routes } from '@angular/router';


export const USER_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },    
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard-user/dashboard-user.component').then(m => m.DashboardUserComponent),
        title: 'Pagina Inicio - Admin'
    }

]