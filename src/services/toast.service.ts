
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private lastId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const newToast: Toast = { id: ++this.lastId, message, type };
    this.toasts.update(toasts => [...toasts, newToast]);
    setTimeout(() => this.remove(newToast.id), 5000);
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
