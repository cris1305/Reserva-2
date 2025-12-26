import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed bottom-5 right-5 z-50 space-y-3">
      @for (toast of toasts(); track toast.id; let i = $index) {
        <div 
          [style.background-color]="toastColors()[i]"
          class="text-white px-6 py-3 rounded-xl shadow-xl flex items-center justify-between animate-fade-in-up">
          <span>{{ toast.message }}</span>
          <button (click)="removeToast(toast.id)" class="ml-4 font-bold text-xl">&times;</button>
        </div>
      }
    </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  toastColors = computed(() => {
    return this.toasts().map(toast => {
      switch (toast.type) {
        case 'success':
          return '#8CC63F'; // Verde Tecnológico
        case 'error':
          return '#ef4444'; // rose-500
        default:
          return '#00ADEF'; // Celeste Innovación
      }
    });
  });

  removeToast(id: number) {
    this.toastService.remove(id);
  }
}