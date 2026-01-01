
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { User, UserRole } from '../../../models';
import { GeminiService } from '../../../services/gemini.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit {
  dataService = inject(DataService);
  toastService = inject(ToastService);
  geminiService = inject(GeminiService);

  users = this.dataService.users;
  showForm = signal(false);
  aiAnalysis = signal<'loading' | string | null>('loading');

  newUser: Omit<User, 'id'> = {
    fullName: '',
    email: '',
    role: 'Docente',
    password: '',
  };

  ngOnInit(): void {
    this.getAiAnalysis();
  }

  async getAiAnalysis() {
    this.aiAnalysis.set('loading');
    try {
      const analysis = await this.geminiService.generateUserAnalysis(this.users());
      this.aiAnalysis.set(analysis);
    } catch (error) {
      console.error(error);
      this.aiAnalysis.set(null);
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    const success = this.dataService.addUser(this.newUser);
    if (success) {
      this.toastService.show('Usuario creado con éxito', 'success');
      this.resetForm(form);
      this.getAiAnalysis(); // Re-fetch analysis after adding a user
    } else {
      this.toastService.show('El email ya está en uso', 'error');
    }
  }

  resetForm(form: NgForm) {
    form.resetForm({ role: 'Docente' });
    this.showForm.set(false);
  }
}
