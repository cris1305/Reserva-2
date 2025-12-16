
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { User, UserRole } from '../../../models';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  users = this.dataService.users;
  showForm = signal(false);

  newUser: Omit<User, 'id'> = {
    fullName: '',
    email: '',
    role: 'Docente',
    password: '',
  };

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    const success = this.dataService.addUser(this.newUser);
    if (success) {
      this.toastService.show('Usuario creado con éxito', 'success');
      this.resetForm(form);
    } else {
      this.toastService.show('El email ya está en uso', 'error');
    }
  }

  resetForm(form: NgForm) {
    form.resetForm({ role: 'Docente' });
    this.showForm.set(false);
  }
}
