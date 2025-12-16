import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { Reservation, ReservationStatus } from '../../../models';

@Component({
  selector: 'app-my-reservations',
  templateUrl: './my-reservations.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReservationsComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);

  myReservations = computed(() => {
    const userId = this.authService.currentUser()?.id;
    return userId ? this.dataService.getReservationsForUser(userId) : [];
  });
  
  getResourceName(reservation: Reservation): string {
    if (reservation.equipmentId) {
        return this.dataService.getEquipmentName(reservation.equipmentId);
    }
    if (reservation.spaceId) {
        return this.dataService.getSpaceName(reservation.spaceId);
    }
    return 'Recurso desconocido';
  }
  
  getStatusClass(status: ReservationStatus): string {
    switch(status) {
      case 'Aprobada': return 'bg-teal-100 text-teal-800';
      case 'Rechazada': return 'bg-rose-100 text-rose-800';
      case 'Pendiente': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}