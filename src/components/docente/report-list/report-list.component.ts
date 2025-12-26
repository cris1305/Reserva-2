
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ReportStatus } from '../../../models';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportListComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);

  myReports = computed(() => {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return [];
    return this.dataService.reports()
      .filter(r => r.solicitanteId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  });

  getStatusClass(status: ReportStatus): string {
    switch(status) {
      case 'Abierto': return 'bg-rose-100 text-rose-800';
      case 'En Proceso': return 'bg-orange-100 text-orange-800';
      case 'Cerrado': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}