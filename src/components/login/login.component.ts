
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  template: `
<div class="min-h-screen flex items-center justify-center bg-slate-100">
  <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
    <div class="text-center">
        <svg class="mx-auto h-12 w-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.5m0 0a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75ZM12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">
        Sistema de Reservas INATEC
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Inicie sesión para acceder a su panel
      </p>
    </div>
    <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()" #loginForm="ngForm">
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email-address" class="sr-only">Email</label>
          <input id="email-address" name="email" type="email" [(ngModel)]="email" required
                 class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 placeholder="Email">
        </div>
        <div>
          <label for="password" class="sr-only">Contraseña</label>
          <input id="password" name="password" type="password" [(ngModel)]="password" required
                 class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 placeholder="Contraseña">
        </div>
      </div>

      @if (errorMessage()) {
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error:</strong>
            <span class="block sm:inline ml-2">{{ errorMessage() }}</span>
        </div>
      }

      <div>
        <button type="submit" [disabled]="!loginForm.form.valid"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
          Iniciar Sesión
        </button>
      </div>
    </form>
  </div>
</div>
  `,
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  errorMessage = signal<string | null>(null);

  onSubmit() {
    this.errorMessage.set(null);
    const success = this.authService.login(this.email, this.password);
    if (!success) {
      this.errorMessage.set('Credenciales incorrectas. Por favor, intente de nuevo.');
    }
  }
}