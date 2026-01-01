
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { Report, ReportStatus } from '../../../models';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportListComponent {
  dataService = inject(DataService);
  
  filter = signal<ReportStatus | 'Todos'>('Todos');
  
  filteredReports = computed(() => {
    const reports = this.dataService.reports().sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    if (this.filter() === 'Todos') {
      return reports;
    }
    return reports.filter(r => r.status === this.filter());
  });

  setFilter(status: ReportStatus | 'Todos') {
    this.filter.set(status);
  }

  getStatusClass(status: ReportStatus): string {
    switch(status) {
      case 'Abierto': return 'bg-rose-100 text-rose-800';
      case 'En Proceso': return 'bg-orange-100 text-orange-800';
      case 'Cerrado': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getFilterButtonClass(status: ReportStatus | 'Todos'): string {
    const baseClass = 'px-4 py-2 text-sm font-medium rounded-md transition-colors';
    if (this.filter() === status) {
        return `${baseClass} bg-rose-600 text-white`;
    }
    return `${baseClass} bg-white text-gray-700 hover:bg-slate-100 border`;
  }
}
