

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { Equipment, Category } from '../../../models';

type Resource = Category | Equipment;
type ResourceType = 'Category' | 'Equipment';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryManagementComponent {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  categories = this.dataService.categories;
  equipmentList = this.dataService.equipment;

  // Modal and form state
  modalMode = signal<'add' | 'edit'>('add');
  
  showCategoryModal = signal(false);
  editingCategory = signal<Category | null>(null);
  
  showEquipmentModal = signal(false);
  editingEquipment = signal<Equipment | null>(null);

  showDeleteConfirmation = signal(false);
  resourceToDelete = signal<{ resource: Resource, type: ResourceType } | null>(null);

  private getInitialEquipmentForm(): Omit<Equipment, 'id' | 'status'> {
    return {
      name: '',
      uniqueIdentifier: '',
      description: '',
      categoryId: 0,
      imageUrl: '',
    };
  }

  // Category Actions
  openCategoryModal(mode: 'add' | 'edit', category?: Category) {
    this.modalMode.set(mode);
    if (mode === 'edit' && category) {
      this.editingCategory.set({ ...category });
    } else {
      this.editingCategory.set({ id: 0, name: '', imageUrl: '' });
    }
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
    this.editingCategory.set(null);
  }

  onSaveCategory(form: NgForm) {
    if (form.invalid || !this.editingCategory()) return;
    
    const categoryData = this.editingCategory()!;
    const payload = {
        name: categoryData.name.trim(),
        imageUrl: categoryData.imageUrl?.trim() || undefined
    };

    let success = false;
    if (this.modalMode() === 'add') {
        success = this.dataService.addCategory(payload);
    } else {
        success = this.dataService.updateCategory({ ...payload, id: categoryData.id });
    }

    if (success) {
      this.toastService.show(`Categoría ${this.modalMode() === 'add' ? 'creada' : 'actualizada'} con éxito`, 'success');
      this.closeCategoryModal();
    } else {
      this.toastService.show('El nombre de la categoría ya existe', 'error');
    }
  }

  // Equipment Actions
  openEquipmentModal(mode: 'add' | 'edit', equipment?: Equipment) {
    this.modalMode.set(mode);
    if (mode === 'edit' && equipment) {
      this.editingEquipment.set({ ...equipment });
    } else {
      this.editingEquipment.set({ ...this.getInitialEquipmentForm(), id: 0, status: 'Disponible' });
    }
    this.showEquipmentModal.set(true);
  }
  
  closeEquipmentModal() {
    this.showEquipmentModal.set(false);
    this.editingEquipment.set(null);
  }

  onSaveEquipment(form: NgForm) {
    if (form.invalid || !this.editingEquipment()) return;

    const equipmentData = this.editingEquipment()!;
    const payload = {
      name: equipmentData.name,
      uniqueIdentifier: equipmentData.uniqueIdentifier,
      description: equipmentData.description,
      categoryId: equipmentData.categoryId,
      imageUrl: equipmentData.imageUrl?.trim() || undefined
    };

    if (this.modalMode() === 'add') {
      this.dataService.addEquipment(payload);
    } else {
      this.dataService.updateEquipment({ ...payload, id: equipmentData.id, status: equipmentData.status });
    }
    this.toastService.show(`Equipo ${this.modalMode() === 'add' ? 'añadido' : 'actualizado'} con éxito`, 'success');
    this.closeEquipmentModal();
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

    if (toDelete.type === 'Category') {
      const success = this.dataService.deleteCategory(toDelete.resource.id);
      if (success) {
        this.toastService.show('Categoría eliminada con éxito', 'success');
      } else {
        this.toastService.show('No se puede eliminar la categoría porque está en uso por algún equipo.', 'error');
      }
    } else if (toDelete.type === 'Equipment') {
      this.dataService.deleteEquipment(toDelete.resource.id);
      this.toastService.show('Equipo eliminado con éxito', 'success');
    }

    this.closeDeleteConfirmation();
  }
}
