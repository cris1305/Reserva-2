import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { Space, SpaceType } from '../../../models';

type Resource = SpaceType | Space;
type ResourceType = 'SpaceType' | 'Space';

@Component({
  selector: 'app-space-management',
  templateUrl: './space-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceManagementComponent {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  spaceTypes = this.dataService.spaceTypes;
  spaces = this.dataService.spaces;

  // Modal and form state
  modalMode = signal<'add' | 'edit'>('add');
  
  showSpaceTypeModal = signal(false);
  editingSpaceType = signal<SpaceType | null>(null);

  showSpaceModal = signal(false);
  editingSpace = signal<Space | null>(null);

  showDeleteConfirmation = signal(false);
  resourceToDelete = signal<{ resource: Resource, type: ResourceType } | null>(null);

  private getInitialSpaceForm(): Omit<Space, 'id'> {
    return {
      name: '',
      spaceTypeId: 0,
      description: '',
      capacity: 0,
      latitude: 0,
      longitude: 0,
      imageUrl: '',
    };
  }

  // SpaceType Actions
  openSpaceTypeModal(mode: 'add' | 'edit', spaceType?: SpaceType) {
    this.modalMode.set(mode);
    if (mode === 'edit' && spaceType) {
      this.editingSpaceType.set({ ...spaceType });
    } else {
      this.editingSpaceType.set({ id: 0, name: '', imageUrl: '' });
    }
    this.showSpaceTypeModal.set(true);
  }

  closeSpaceTypeModal() {
    this.showSpaceTypeModal.set(false);
    this.editingSpaceType.set(null);
  }

  onSaveSpaceType(form: NgForm) {
    if (form.invalid || !this.editingSpaceType()) return;
    
    const spaceTypeData = this.editingSpaceType()!;
    const payload = {
        name: spaceTypeData.name.trim(),
        imageUrl: spaceTypeData.imageUrl?.trim() || undefined
    };

    let success = false;
    if (this.modalMode() === 'add') {
        success = this.dataService.addSpaceType(payload);
    } else {
        success = this.dataService.updateSpaceType({ ...payload, id: spaceTypeData.id });
    }

    if (success) {
      this.toastService.show(`Tipo de espacio ${this.modalMode() === 'add' ? 'creado' : 'actualizado'} con éxito`, 'success');
      this.closeSpaceTypeModal();
    } else {
      this.toastService.show('El nombre del tipo de espacio ya existe', 'error');
    }
  }

  // Space Actions
  openSpaceModal(mode: 'add' | 'edit', space?: Space) {
    this.modalMode.set(mode);
    if (mode === 'edit' && space) {
      this.editingSpace.set({ ...space });
    } else {
      this.editingSpace.set({ ...this.getInitialSpaceForm(), id: 0 });
    }
    this.showSpaceModal.set(true);
  }

  closeSpaceModal() {
    this.showSpaceModal.set(false);
    this.editingSpace.set(null);
  }

  onSaveSpace(form: NgForm) {
    if (form.invalid || !this.editingSpace()) return;

    const spaceData = this.editingSpace()!;
    const payload = {
      name: spaceData.name,
      spaceTypeId: spaceData.spaceTypeId,
      description: spaceData.description,
      capacity: spaceData.capacity,
      latitude: spaceData.latitude,
      longitude: spaceData.longitude,
      imageUrl: spaceData.imageUrl?.trim() || undefined
    };

    if (this.modalMode() === 'add') {
      this.dataService.addSpace(payload);
    } else {
      this.dataService.updateSpace({ ...payload, id: spaceData.id });
    }
    this.toastService.show(`Espacio ${this.modalMode() === 'add' ? 'añadido' : 'actualizado'} con éxito`, 'success');
    this.closeSpaceModal();
  }

  // Delete Actions
  openDeleteConfirmation(resource: Resource, type: ResourceType) {
    this.resourceToDelete.set({ resource, type });
    this.showDeleteConfirmation.set(true);
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirmation.set(false);
    this.resourceToDelete.set(null);
  }

  confirmDelete() {
    const toDelete = this.resourceToDelete();
    if (!toDelete) return;

    if (toDelete.type === 'SpaceType') {
      const success = this.dataService.deleteSpaceType(toDelete.resource.id);
      if (success) {
        this.toastService.show('Tipo de espacio eliminado con éxito', 'success');
      } else {
        this.toastService.show('No se puede eliminar el tipo de espacio porque está en uso.', 'error');
      }
    } else if (toDelete.type === 'Space') {
      this.dataService.deleteSpace(toDelete.resource.id);
      this.toastService.show('Espacio eliminado con éxito', 'success');
    }

    this.closeDeleteConfirmation();
  }
}
