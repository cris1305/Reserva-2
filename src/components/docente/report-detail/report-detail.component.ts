
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Report, ReportStatus } from '../../../models';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

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
    
    this.dataService.addReportMessage({
        reportId: this.reportId(),
        authorId: this.authService.currentUser()!.id,
        text: this.newMessage().trim(),
    });
    
    this.newMessage.set('');
    this.toastService.show('Mensaje enviado', 'success');
  }

  getStatusClass(status: ReportStatus): string {
    switch(status) {
      case 'Abierto': return 'bg-rose-100 text-rose-800';
      case 'En Proceso': return 'bg-orange-100 text