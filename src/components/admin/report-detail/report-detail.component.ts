
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { NotificationService } from '../../../services/notification.service';
import { Report, ReportStatus } from '../../../models';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  notificationService = inject(NotificationService);

  reportId = signal<number>(0);
  newMessage = signal('');

  report = computed<Report | undefined>(() => {
    return this.dataService.reports().find(r => r.id === this.reportId());
  });

  messages = computed(() => {
    return this.dataService.reportMessages()
      .filter(m => m.reportId === this.reportId())
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  });

  constructor() {
    this.reportId.set(Number(this.route.snapshot.paramMap.get('id')));
  }
  
  sendMessage() {
    if (!this.newMessage().trim() || !this.report() || !this.authService.currentUser()) return;
    
    const messageData = {
        reportId: this.reportId(),
        authorId: this.authService.currentUser()!.id,
        text: this.newMessage().trim(),
    };
    
    this.dataService.addReportMessage(messageData);
    const report = this.report();
    const message = this.messages().slice(-1)[0]; // get the last message added
    if (report && message) {
        this.notificationService.notifyNewReportMessage(report, message);
    }
    
    this.newMessage.set('');
    this.toastService.show('Respuesta enviada', 'success');
  }

  onStatusChange(event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value as ReportStatus;
    this.dataService.updateReportStatus(this.reportId(), newStatus);
    this.toastService.show(`Estado del reporte actualizado a "${newStatus}"`, 'info');
  }

  getStatusClass(status: ReportStatus): string {
    switch(status) {
      case 'Abierto': return 'bg-rose-100 text-rose-800';
      case 'En Proceso': return 'bg-orange-100 text-orange-800';
      case 'Cerrado': return 'bg-green-100 text-green-800';
    }
  }
}
