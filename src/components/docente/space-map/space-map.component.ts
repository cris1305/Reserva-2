import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Space } from '../../../models';

declare var L: any; // Declare Leaflet to avoid TypeScript errors

@Component({
  selector: 'app-space-map',
  templateUrl: './space-map.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceMapComponent implements AfterViewInit, OnDestroy {
  dataService = inject(DataService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  
  private map: any;
  private markers: any[] = [];
  selectedSpace = signal<Space | null>(null);
  showReservationForm = signal(false);
  searchTerm = signal('');
  noResults = signal(false);

  reservationDate = '';
  startTime = '';
  endTime = '';

  availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  private createIcon(color: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <circle cx="12" cy="12" r="11" fill="${color}" fill-opacity="0.8" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="5" fill="white" fill-opacity="0.9"/>
    </svg>`;
    return L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  private greenIcon = this.createIcon('#22c55e'); // Libre
  private orangeIcon = this.createIcon('#f97316'); // En Espera
  private redIcon = this.createIcon('#ef4444'); // Reservada

  weeklyAvailability = computed(() => {
    if (!this.selectedSpace()) return [];
    
    const spaceId = this.selectedSpace()!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
    });

    return weekDays.map(date => {
        const startRange = new Date(date);
        const endRange = new Date(date);
        endRange.setHours(23, 59, 59, 999);

        const reservations = this.dataService.getReservationsForSpace(spaceId, startRange, endRange);
        return {
            date: date,
            reservations: reservations.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        };
    });
  });

  reportUrl = computed(() => {
    const role = this.authService.currentUser()?.role;
    if (role === 'Admin') {
      return '/admin/create-report';
    }
    return '/docente/create-report';
  });

  constructor() {
    effect(() => {
      // Re-render markers if the map is initialized and reservations change.
      this.dataService.reservations(); // Track the signal for changes
      if (this.map) {
        this.addMarkers();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (typeof document !== 'undefined' && document.getElementById('map')) {
      const mapCenter: [number, number] = [12.1328, -86.2504];
      
      this.map = L.map('map').setView(mapCenter, 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);

      this.addMarkers();
      this.addLegend();
    }
  }

  private addLegend(): void {
    const legend = new L.Control({ position: 'bottomright' });

    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend bg-white p-3 rounded-lg shadow-lg space-y-2');
        const statuses = {
            'Libre': '#22c55e',
            'En Espera': '#f97316',
            'Reservada': '#ef4444'
        };
        let innerHTML = '<h4 class="font-bold text-sm mb-2 text-gray-700">Estado Actual</h4>';
        
        for (const status in statuses) {
            innerHTML += 
                '<div class="flex items-center gap-2">' +
                `<i style="background:${statuses[status as keyof typeof statuses]}; width: 18px; height: 18px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,0.1);"></i>` +
                `<span class="text-sm text-gray-600">${status}</span>` +
                '</div>';
        }

        div.innerHTML = innerHTML;
        return div;
    };

    legend.addTo(this.map);
  }

  private getSpaceStatus(spaceId: number): 'available' | 'pending' | 'occupied' {
    const now = new Date();
    const reservations = this.dataService.reservations().filter(r => 
        r.spaceId === spaceId &&
        now >= r.startTime &&
        now < r.endTime
    );

    if (reservations.some(r => r.status === 'Aprobada')) {
        return 'occupied';
    }
    if (reservations.some(r => r.status === 'Pendiente')) {
        return 'pending';
    }
    return 'available';
  }

  private addMarkers(): void {
    const spaces = this.dataService.spaces();
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    
    for (const space of spaces) {
      const status = this.getSpaceStatus(space.id);
      let icon;
      switch (status) {
        case 'occupied':
          icon = this.redIcon;
          break;
        case 'pending':
          icon = this.orangeIcon;
          break;
        default: // 'available'
          icon = this.greenIcon;
          break;
      }

      const marker = L.marker([space.latitude, space.longitude], { icon });
      (marker as any).spaceData = space;
      marker.on('click', () => {
        this.openModal(space);
      });
      this.markers.push(marker);
    }
    this.filterMarkers(); // This will add them to the map
  }

  private filterMarkers(): void {
    const term = this.searchTerm().toLowerCase();
    let resultsFound = false;

    this.markers.forEach(marker => {
        const spaceName = (marker as any).spaceData.name.toLowerCase();
        if (spaceName.includes(term)) {
            if (!this.map.hasLayer(marker)) {
                marker.addTo(this.map);
            }
            resultsFound = true;
        } else {
            if (this.map.hasLayer(marker)) {
                marker.remove();
            }
        }
    });

    this.noResults.set(!resultsFound && term.length > 0);
  }
  
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.filterMarkers();
  }

  openModal(space: Space) {
    this.selectedSpace.set(space);
    this.showReservationForm.set(false);
  }

  closeModal() {
    this.selectedSpace.set(null);
    this.showReservationForm.set(false);
    this.reservationDate = '';
    this.startTime = '';
    this.endTime = '';
  }

  revealReservationForm() {
    this.showReservationForm.set(true);
    // Wait for the DOM to update before scrolling
    setTimeout(() => {
      document.getElementById('reservationFormContainer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.selectedSpace() || !this.authService.currentUser()) return;
    
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    const startDate = new Date(this.reservationDate);
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(this.reservationDate);
    endDate.setHours(endHour, endMinute, 0, 0);

    if (endDate <= startDate) {
      this.toastService.show('La hora de fin debe ser posterior a la hora de inicio', 'error');
      return;
    }
    
    const success = this.dataService.addReservation({
      spaceId: this.selectedSpace()!.id,
      solicitanteId: this.authService.currentUser()!.id,
      startTime: startDate,
      endTime: endDate
    });

    if (success) {
      this.toastService.show(`Solicitud para ${this.selectedSpace()?.name} enviada`, 'success');
      this.closeModal();
    } else {
      this.toastService.show('El horario seleccionado se solapa con una reserva existente', 'error');
    }
  }
}
