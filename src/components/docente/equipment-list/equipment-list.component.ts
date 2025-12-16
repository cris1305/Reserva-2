

import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Equipment } from '../../../models';

@Component({
  selector: 'app-equipment-list',
  templateUrl: './equipment-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentListComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  
  searchTerm = signal('');
  equipmentList = this.dataService.equipment;

  filteredEquipmentList = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.equipmentList();
    }
    return this.equipmentList().filter(equipment => 
      equipment.name.toLowerCase().includes(term)
    );
  });
  
  selectedEquipment = signal<Equipment | null>(null);

  reservationDate = '';
  startTime = '';
  endTime = '';

  availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  openReservationModal(equipment: Equipment) {
    this.selectedEquipment.set(equipment);
  }

  closeModal() {
    this.selectedEquipment.set(null);
    this.reservationDate = '';
    this.startTime = '';
    this.endTime = '';
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.selectedEquipment() || !this.authService.currentUser()) return;
    
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
      equipmentId: this.selectedEquipment()!.id,
      solicitanteId: this.authService.currentUser()!.id,
      startTime: startDate,
      endTime: endDate
    });

    if (success) {
      this.toastService.show('Solicitud de reserva enviada con éxito', 'success');
      this.closeModal();
    } else {
      this.toastService.show('El horario seleccionado se solapa con una reserva existente', 'error');
    }
  }
}