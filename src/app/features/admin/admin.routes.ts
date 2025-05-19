import { Routes } from '@angular/router';


export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'reportes',
        loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent),
        title: "Reportes Estadísticos"
    },
    {
        path: 'articulos',
        loadComponent: () => import('./articulos/articulos.component').then(m => m.ArticulosComponent),
        title: 'Gestión de Articulos'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent),
        title: 'Pagina Inicio - Admin'
    }

]