
import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-docente-dashboard',
  templateUrl: './docente-dashboard.component.html',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocenteDashboardComponent {
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
      this.isOnDashboard.set(event.urlAfterRedirects === '/docente/equipment' || event.urlAfterRedirects === '/docente');
    });
    // Initial check for when the component loads
    this.isOnDashboard.set(this.router.url === '/docente/equipment' || this.router.url === '/docente');
  }

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  docenteNavLinks = [
    { path: '/docente/equipment', label: 'Equipos Disponibles', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5m-9 7.5h9v-7.5h-9v7.5Zm-9 7.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 6.75 21Z" />' },
    { path: '/docente/my-reservations', label: 'Mis Reservas', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />' },
    { path: '/docente/reports', label: 'Mis Reportes', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />' },
    { path: '/docente/map', label: 'Mapa de Espacios', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />' },
    { path: '/docente/calendar', label: 'Calendario', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />' }
  ];
}
