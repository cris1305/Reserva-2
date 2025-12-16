import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="relative min-h-screen">
      <router-outlet></router-outlet>
      <app-toast></app-toast>
    </div>
  `,
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'Sistema de Reservas INATEC';
}
