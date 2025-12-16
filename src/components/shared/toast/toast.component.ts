import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed bottom-5 right-5 z-50 space-y-3">
      @for (toast of toasts(); track toast.id; let i = $index) {
        <div 
          [class]="'text-white px-6 py-3 rounded-xl shadow-xl flex items-center justify-between animate-fade-in-up ' + toastColors()[i]">
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
          return 'bg-teal-500';
        case 'error':
          return 'bg-rose-500';
        default:
          return 'bg-sky-500';
      }
    });
  });

  removeToast(id: number) {
    this.toastService.remove(id);
  }
}
