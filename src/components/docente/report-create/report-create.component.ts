

import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Report } from '../../../models';

@Component({
  selector: 'app-report-create',
  templateUrl: './report-create.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCreateComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  resourceType = signal('');
  resourceId = signal(0);
  
  backLinkUrl = signal('');
  backLinkText = signal('');

  newReport: Pick<Report, 'title' | 'description'> = {
    title: '',
    description: '',
  };

  resourceName = computed(() => {
    if(this.resourceType() === 'equipment') {
        return this.dataService.getEquipmentName(this.resourceId());
    }
    if (this.resourceType() === 'space') {
        return this.dataService.getSpaceName(this.resourceId());
    }
    return 'Recurso no identificado';
  });

  constructor() {
    const params = this.route.snapshot.queryParams;
    const resourceId = Number(params['resourceId']);
    const resourceType = params['resourceType'];
    const from = params['from'];
    const role = this.authService.currentUser()?.role?.toLowerCase();

    if (resourceId && (resourceType === 'equipment' || resourceType === 'space')) {
        this.resourceId.set(resourceId);
        this.resourceType.set(resourceType);
    } else {
        this.toastService.show('Error: URL inválida. No se pudo identificar el recurso.', 'error');
    }

    if (role) {
      if (from === '/map') {
          this.backLinkUrl.set(`/${role}/map`);
          this.backLinkText.set('Volver al Mapa');
      } else {
          // Default to the user's report list
          this.backLinkUrl.set(`/${role}/reports`);
          this.backLinkText.set(role === 'admin' ? 'Volver a Reportes' : 'Volver a Mis Reportes');
      }
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.resourceId() || !this.authService.currentUser()) {
        this.toastService.show('Error: No se pudo identificar el recurso o el usuario.', 'error');
        return;
    };

    const reportData: Omit<Report, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
        title: this.newReport.title,
        description: this.newReport.description,
        solicitanteId: this.authService.currentUser()!.id,
        equipmentId: this.resourceType() === 'equipment' ? this.resourceId() : undefined,
        spaceId: this.resourceType() === 'space' ? this.resourceId() : undefined,
    };
    
    this.dataService.addReport(reportData);
    this.toastService.show('Reporte enviado correctamente', 'success');
    
    const role = this.authService.currentUser()?.role?.toLowerCase();
    if (role) {
      this.router.navigate([`/${role}/reports`]);
    } else {
      this.router.navigate(['/login']); // Fallback
    }
  }
}