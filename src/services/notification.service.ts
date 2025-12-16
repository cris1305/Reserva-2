
import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';
import { Reservation, Report, ReportMessage, User } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  dataService = inject(DataService);

  private logNotification(recipient: User | undefined, subject: string, body: string) {
    if (!recipient) return;
    console.log(`
      =================================================
      |           SIMULACIÓN DE NOTIFICACIÓN          |
      =================================================
      | Para: ${recipient.email}
      | Asunto: ${subject}
      -------------------------------------------------
      |
      |   ${body.replace(/\n/g, '\n      |   ')}
      |
      =================================================
    `);
  }

  notifyReservationStatus(reservation: Reservation) {
    const solicitante = this.dataService.users().find(u => u.id === reservation.solicitanteId);
    const resourceName = this.dataService.getResourceName(reservation);
    const subject = `Actualización de tu reserva: ${resourceName}`;
    const body = `Hola ${solicitante?.fullName},\n\nTu solicitud de reserva para "${resourceName}" ha sido ${reservation.status}.\n\nGracias,\nSistema de Reservas INATEC`;
    
    this.logNotification(solicitante, subject, body);
  }

  notifyNewReportMessage(report: Report, message: ReportMessage) {
    const solicitante = this.dataService.users().find(u => u.id === report.solicitanteId);
    const author = this.dataService.users().find(u => u.id === message.authorId);

    if (solicitante && author && solicitante.id !== author.id) {
        const subject = `Nueva respuesta a tu reporte: "${report.title}"`;
        const body = `Hola ${solicitante.fullName},\n\n${author.fullName} ha respondido a tu reporte de incidencia:\n\n"${message.text}"\n\nPuedes ver la conversación completa en el portal.\n\nGracias,\nSistema de Reservas INATEC`;
        this.logNotification(solicitante, subject, body);
    }
  }
}
