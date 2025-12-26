import { Component, ChangeDetectionStrategy, inject, signal, computed, ElementRef, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { GeminiService } from '../../../services/gemini.service';
import { Equipment } from '../../../models';

type SuggestionResult = {
  recommendation: Equipment;
  justification: string;
}

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
  geminiService = inject(GeminiService);
  
  equipmentContainer = viewChild<ElementRef>('equipmentContainer');

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

  // IA Suggestion State
  suggestionQuery = signal('');
  suggestionResult = signal<SuggestionResult | 'loading' | 'error' | 'idle' | 'not_found'>('idle');

  reservationDate = '';
  startTime = '';
  endTime = '';

  availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  async getAiSuggestion() {
    if (!this.suggestionQuery().trim()) return;
    this.suggestionResult.set('loading');
    try {
      const availableEquipment = this.equipmentList().filter(e => e.status === 'Disponible');
      const result = await this.geminiService.generateEquipmentRecommendation(this.suggestionQuery(), availableEquipment);
      
      const recommended = this.equipmentList().find(e => e.id === result.recommendedEquipmentId);

      if (recommended) {
        this.suggestionResult.set({
          recommendation: recommended,
          justification: result.justification
        });
        // Scroll to the item after a short delay to allow UI to update
        setTimeout(() => this.scrollToRecommended(recommended.id), 100);
      } else {
        this.suggestionResult.set('not_found');
      }

    } catch (error) {
      this.suggestionResult.set('error');
    }
  }

  scrollToRecommended(equipmentId: number) {
    const element = document.getElementById(`equipment-${equipmentId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

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
