import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { ActivityChartComponent } from '../activity-chart/activity-chart.component';
import { GeminiService } from '../../../services/gemini.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ActivityChartComponent],
  templateUrl: './admin-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomeComponent implements OnInit {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);

  pendingReservationsCount = computed(() => this.dataService.pendingReservations().length);
  spacesOccupiedToday = this.dataService.spacesOccupiedTodayCount;
  equipmentInUseToday = this.dataService.equipmentInUseTodayCount;
  openReportsCount = this.dataService.openReportsCount;
  
  chartData = this.dataService.mainAuditoriumUsageLast7Days;
  
  // Señal para el resumen de IA
  aiSummary = signal<'loading' | string | null>('loading');

  ngOnInit(): void {
    this.getAiSummary();
  }
  
  async getAiSummary() {
    this.aiSummary.set('loading');
    try {
      const metrics = {
        pendingReservations: this.pendingReservationsCount(),
        spacesOccupied: this.spacesOccupiedToday(),
        equipmentInUse: this.equipmentInUseToday(),
        openReports: this.openReportsCount()
      };
      const summary = await this.geminiService.generateDashboardSummary(metrics);
      this.aiSummary.set(summary);
    } catch (error) {
      console.error(error);
      this.aiSummary.set(null); // Establecer en null en caso de error
    }
  }
}
