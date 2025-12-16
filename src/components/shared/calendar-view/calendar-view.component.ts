import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';

declare var FullCalendar: any;

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent implements AfterViewInit, OnDestroy {
  dataService = inject(DataService);
  private calendar: any;

  calendarEvents = computed(() => {
    return this.dataService.approvedSpaceReservations().map(res => ({
        title: this.dataService.getSpaceName(res.spaceId!),
        start: res.startTime,
        end: res.endTime,
        backgroundColor: '#10B981', // teal-500
        borderColor: '#059669', // teal-600
    }));
  });

  ngAfterViewInit(): void {
    if (typeof document !== 'undefined' && document.getElementById('calendar')) {
      const calendarEl = document.getElementById('calendar');
      this.calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: this.calendarEvents(),
        locale: 'es',
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
        },
        height: 'auto'
      });
      this.calendar.render();
    }
  }

  ngOnDestroy(): void {
    if (this.calendar) {
      this.calendar.destroy();
    }
  }
}