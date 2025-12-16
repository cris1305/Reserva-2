

import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
    canActivate: [() => inject(AuthService).isAdmin()],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/admin/admin-home/admin-home.component').then(c => c.AdminHomeComponent) },
      { path: 'reservations', loadComponent: () => import('./components/admin/reservation-requests/reservation-requests.component').then(c => c.ReservationRequestsComponent) },
      { path: 'inventory', loadComponent: () => import('./components/admin/inventory-management/inventory-management.component').then(c => c.InventoryManagementComponent) },
      { path: 'users', loadComponent: () => import('./components/admin/user-management/user-management.component').then(c => c.UserManagementComponent) },
      { path: 'spaces', loadComponent: () => import('./components/admin/space-management/space-management.component').then(c => c.SpaceManagementComponent) },
      { path: 'map', loadComponent: () => import('./components/docente/space-map/space-map.component').then(c => c.SpaceMapComponent) },
      { path: 'calendar', loadComponent: () => import('./components/shared/calendar-view/calendar-view.component').then(c => c.CalendarViewComponent) },
      { path: 'reports', loadComponent: () => import('./components/admin/report-list/report-list.component').then(c => c.ReportListComponent) },
      { path: 'reports/:id', loadComponent: () => import('./components/admin/report-detail/report-detail.component').then(c => c.ReportDetailComponent) },
      { path: 'create-report', loadComponent: () => import('./components/docente/report-create/report-create.component').then(c => c.ReportCreateComponent) },
    ]
  },
  { 
    path: 'docente',
    loadComponent: () => import('./components/docente/docente-dashboard/docente-dashboard.component').then(c => c.DocenteDashboardComponent),
    canActivate: [() => inject(AuthService).isDocente()],
    children: [
      { path: '', redirectTo: 'equipment', pathMatch: 'full' },
      { path: 'equipment', loadComponent: () => import('./components/docente/equipment-list/equipment-list.component').then(c => c.EquipmentListComponent) },
      { path: 'my-reservations', loadComponent: () => import('./components/docente/my-reservations/my-reservations.component').then(c => c.MyReservationsComponent) },
      { path: 'map', loadComponent: () => import('./components/docente/space-map/space-map.component').then(c => c.SpaceMapComponent) },
      { path: 'calendar', loadComponent: () => import('./components/shared/calendar-view/calendar-view.component').then(c => c.CalendarViewComponent) },
      { path: 'reports', loadComponent: () => import('./components/docente/report-list/report-list.component').then(c => c.ReportListComponent) },
      { path: 'reports/:id', loadComponent: () => import('./components/docente/report-detail/report-detail.component').then(c => c.ReportDetailComponent) },
      { path: 'create-report', loadComponent: () => import('./components/docente/report-create/report-create.component').then(c => c.ReportCreateComponent) },
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];