
import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  isSidebarOpen = signal(false);
  isOnDashboard = signal(true);
  
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      this.isSidebarOpen.set(false);
      this.isOnDashboard.set(event.urlAfterRedirects === '/admin/dashboard' || event.urlAfterRedirects === '/admin');
    });
    // Initial check for when the component loads
    this.isOnDashboard.set(this.router.url === '/admin/dashboard' || this.router.url === '/admin');
  }
  
  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  adminNavLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />' },
    { path: '/admin/reservations', label: 'Solicitudes', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />' },
    { path: '/admin/reports', label: 'Reportes', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />' },
    { path: '/admin/inventory', label: 'Inventario', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4" />' },
    { path: '/admin/spaces', label: 'Espacios', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />' },
    { path: '/admin/map', label: 'Mapa de Espacios', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />' },
    { path: '/admin/users', label: 'Usuarios', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.278 1 1 0 0 0 0-1.414L14.5 10.5M15 19.128v-2.872M15 19.128l-2.625.372a9.337 9.337 0 0 1-4.121-2.278 1 1 0 0 1 0-1.414l2.625-3.375m-5.625 6.375v-2.872m0 0a9.04 9.04 0 0 1 4.121-2.278 1 1 0 0 1 1.414 0l2.625 3.375m0 0a9.04 9.04 0 0 0 4.121 2.278 1 1 0 0 0 1.414 0l-2.625-3.375m-5.625 6.375-2.625.372a9.337 9.337 0 0 1-4.121-2.278 1 1 0 0 1 0-1.414l2.625-3.375M12 3.375c-3.245 0-5.864 2.62-5.864 5.864 0 1.51 1.943 3.52 5.864 6.375 3.92-2.855 5.864-4.865 5.864-6.375 0-3.244-2.619-5.864-5.864-5.864Z" />' },
    { path: '/admin/calendar', label: 'Calendario', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />' }
  ];
}
