
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-reservation-requests',
  templateUrl: './reservation-requests.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationRequestsComponent {
  dataService = inject(DataService);
  toastService = inject(ToastService);
  notificationService = inject(NotificationService);
  
  pendingReservations = this.dataService.pendingReservations;

  approve(id: number) {
    const reservation = this.dataService.reservations().find(r => r.id === id);
    if (reservation) {
        this.dataService.updateReservationStatus(id, 'Aprobada');
        this.notificationService.notifyReservationStatus({ ...reservation, status: 'Aprobada' });
        this.toastService.show('Solicitud aprobada con éxito', 'success');
    }
  }

  reject(id: number) {
    const reservation = this.dataService.reservations().find(r => r.id === id);
    if(reservation) {
        this.dataService.updateReservationStatus(id, 'Rechazada');
        this.notificationService.notifyReservationStatus({ ...reservation, status: 'Rechazada' });
        this.toastService.show('Solicitud rechazada', 'info');
    }
  }
}
