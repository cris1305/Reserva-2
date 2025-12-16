import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { ActivityChartComponent } from '../activity-chart/activity-chart.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ActivityChartComponent],
  templateUrl: './admin-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomeComponent {
  dataService = inject(DataService);

  pendingReservationsCount = computed(() => this.dataService.pendingReservations().length);
  spacesOccupiedToday = this.dataService.spacesOccupiedTodayCount;
  equipmentInUseToday = this.dataService.equipmentInUseTodayCount;
  openReportsCount = this.dataService.openReportsCount;
  
  chartData = this.dataService.mainAuditoriumUsageLast7Days;
}