


import { Injectable, signal, computed } from '@angular/core';
import { User, Category, Equipment, Reservation, ReservationStatus, UserRole, SpaceType, Space, Report, ReportStatus, ReportMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Signals for state management
  users = signal<User[]>([]);
  categories = signal<Category[]>([]);
  equipment = signal<Equipment[]>([]);
  reservations = signal<Reservation[]>([]);
  spaceTypes = signal<SpaceType[]>([]);
  spaces = signal<Space[]>([]);
  reports = signal<Report[]>([]);
  reportMessages = signal<ReportMessage[]>([]);

  // Computed signals
  pendingReservations = computed(() => this.reservations().filter(r => r.status === 'Pendiente').sort((a,b) => b.startTime.getTime() - a.startTime.getTime()));
  approvedSpaceReservations = computed(() => this.reservations().filter(r => r.spaceId && r.status === 'Aprobada'));

  // Dashboard Metrics
  spacesOccupiedTodayCount = computed(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return this.reservations().filter(r => 
        r.spaceId &&
        r.status === 'Aprobada' &&
        r.startTime < todayEnd &&
        r.endTime > todayStart
    ).length;
  });

  equipmentInUseTodayCount = computed(() => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      return this.reservations().filter(r => 
          r.equipmentId &&
          r.status === 'Aprobada' &&
          r.startTime < todayEnd &&
          r.endTime > todayStart
      ).length;
  });

  openReportsCount = computed(() => {
      return this.reports().filter(r => r.status === 'Abierto').length;
  });

  mainAuditoriumUsageLast7Days = computed(() => {
    const KEY_RESOURCE_NAME = 'Aula Magna';
    const keyResource = this.spaces().find(s => s.name === KEY_RESOURCE_NAME);

    if (!keyResource) {
        return { labels: [], data: [], resourceName: 'Recurso no encontrado' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const labels: string[] = [];
    const data: number[] = [];
    const days: Date[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push(date);
        const label = date.toLocaleDateString('es-ES', { weekday: 'short' });
        labels.push(label.charAt(0).toUpperCase() + label.slice(1).replace('.', ''));
    }

    const sevenDaysAgo = days[0];
    const reservations = this.reservations().filter(r =>
        r.spaceId === keyResource.id &&
        r.status === 'Aprobada' &&
        r.startTime >= sevenDaysAgo
    );

    for (const day of days) {
        const dayStart = new Date(day);
        const dayEnd = new Date(day);
        dayEnd.setDate(day.getDate() + 1);
        
        const count = reservations.filter(r =>
            r.startTime >= dayStart && r.startTime < dayEnd
        ).length;
        data.push(count);
    }

    return { labels, data, resourceName: KEY_RESOURCE_NAME };
  });

  constructor() {
    this.seedData();
  }

  private seedData() {
    this.users.set([
      { id: 1, fullName: 'Admin User', email: 'admin@inatec.edu', password: 'password', role: 'Admin' },
      { id: 2, fullName: 'Cristofer Gonzalez', email: 'docente@inatec.edu', password: 'password', role: 'Docente' },
      { id: 3, fullName: 'Maria Rodriguez', email: 'maria@inatec.edu', password: 'password', role: 'Docente' },
    ]);

    this.categories.set([
      { id: 1, name: 'Laptops', imageUrl: 'https://picsum.photos/seed/laptops/400/300' },
      { id: 2, name: 'Proyectores', imageUrl: 'https://picsum.photos/seed/projectors/400/300' },
      { id: 3, name: 'Tablets', imageUrl: 'https://picsum.photos/seed/tablets/400/300' },
    ]);

    this.equipment.set([
      { id: 1, name: 'Laptop Dell Latitude 5420', uniqueIdentifier: 'DLL-5420-01', description: 'Laptop i5, 16GB RAM', categoryId: 1, status: 'Disponible', imageUrl: 'https://picsum.photos/seed/dell5420/600/400' },
      { id: 2, name: 'Proyector Epson PowerLite', uniqueIdentifier: 'EPS-PL-01', description: 'Proyector 3LCD, 3600 lúmenes', categoryId: 2, status: 'Disponible', imageUrl: 'https://picsum.photos/seed/epsonpl/600/400' },
      { id: 3, name: 'Tablet Samsung Galaxy Tab S8', uniqueIdentifier: 'SAM-S8-01', description: 'Tablet Android de 11 pulgadas', categoryId: 3, status: 'Disponible', imageUrl: 'https://picsum.photos/seed/tabs8/600/400' },
      { id: 4, name: 'Laptop HP ProBook 450', uniqueIdentifier: 'HP-PB-450-01', description: 'Laptop i7, 8GB RAM', categoryId: 1, status: 'Disponible', imageUrl: 'https://picsum.photos/seed/hp450/600/400' },
    ]);
    
    this.spaceTypes.set([
      { id: 1, name: 'Laboratorio', imageUrl: 'https://picsum.photos/seed/lab/400/300' },
      { id: 2, name: 'Aula', imageUrl: 'https://picsum.photos/seed/aula/400/300' },
      { id: 3, name: 'Auditorio', imageUrl: 'https://picsum.photos/seed/auditorium/400/300' },
    ]);
    
    this.spaces.set([
        { id: 1, name: 'Laboratorio de Computación 1', spaceTypeId: 1, description: 'Equipado con 20 computadoras de alto rendimiento.', capacity: 20, latitude: 12.1350, longitude: -86.2510, imageUrl: 'https://picsum.photos/seed/complab1/800/600' },
        { id: 2, name: 'Aula Magna', spaceTypeId: 3, description: 'Espacio para conferencias y eventos importantes.', capacity: 150, latitude: 12.1320, longitude: -86.2525, imageUrl: 'https://picsum.photos/seed/aulamagna/800/600' },
        { id: 3, name: 'Aula B-101', spaceTypeId: 2, description: 'Aula de clases teóricas con pizarra digital.', capacity: 30, latitude: 12.1345, longitude: -86.2490, imageUrl: 'https://picsum.photos/seed/aulab101/800/600' },
    ]);

    const now = new Date();
    this.reservations.set([
      { id: 1, equipmentId: 2, solicitanteId: 2, startTime: new Date(now.getTime() + 2 * 24 * 3600 * 1000), endTime: new Date(now.getTime() + (2 * 24 + 2) * 3600 * 1000), status: 'Aprobada' },
      { id: 2, equipmentId: 1, solicitanteId: 3, startTime: new Date(now.getTime() + 1 * 24 * 3600 * 1000), endTime: new Date(now.getTime() + (1 * 24 + 3) * 3600 * 1000), status: 'Pendiente' },
      { id: 3, equipmentId: 3, solicitanteId: 2, startTime: new Date(now.getTime() - 3 * 24 * 3600 * 1000), endTime: new Date(now.getTime() - (3 * 24 - 2) * 3600 * 1000), status: 'Rechazada' },
      { id: 4, spaceId: 1, solicitanteId: 3, startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12), status: 'Aprobada' },
      { id: 5, spaceId: 3, solicitanteId: 2, startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 14), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16), status: 'Pendiente' },
      { id: 6, spaceId: 2, solicitanteId: 3, startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 9), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 12), status: 'Aprobada' },
      // Seed more data for Aula Magna for chart
      { id: 7, spaceId: 2, solicitanteId: 2, startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11), status: 'Aprobada' }, // Today
      { id: 8, spaceId: 2, solicitanteId: 3, startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16), status: 'Aprobada' }, // Yesterday
      { id: 9, spaceId: 2, solicitanteId: 2, startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12), status: 'Aprobada' }, // Yesterday
      { id: 10, spaceId: 2, solicitanteId: 3, startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 9), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 12), status: 'Aprobada' }, // 3 days ago
    ]);

    this.reports.set([
        { id: 1, title: 'Proyector no enciende', description: 'El proyector del Aula B-101 no da señal de video. He probado con varios cables y no funciona.', solicitanteId: 2, status: 'Abierto', createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000), updatedAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000), equipmentId: 2 },
        { id: 2, title: 'Aire acondicionado gotea', description: 'El aire acondicionado del Laboratorio 1 está goteando sobre una de las mesas.', solicitanteId: 3, status: 'En Proceso', createdAt: new Date(now.getTime() - 1 * 24 * 3600 * 1000), updatedAt: new Date(now.getTime() - 12 * 3600 * 1000), spaceId: 1 },
        { id: 3, title: 'Mouse no funciona', description: 'El mouse de la laptop HP está fallando.', solicitanteId: 2, status: 'Cerrado', createdAt: new Date(now.getTime() - 5 * 24 * 3600 * 1000), updatedAt: new Date(now.getTime() - 4 * 24 * 3600 * 1000), equipmentId: 4 },
    ]);

    this.reportMessages.set([
        { id: 1, reportId: 2, authorId: 1, text: 'Gracias por el reporte. Un técnico irá a revisarlo esta tarde.', sentAt: new Date(now.getTime() - 12 * 3600 * 1000) },
        { id: 2, reportId: 3, authorId: 1, text: 'Se ha reemplazado el mouse. ¿Puede confirmar que funciona correctamente?', sentAt: new Date(now.getTime() - (4 * 24 + 2) * 3600 * 1000) },
        { id: 3, reportId: 3, authorId: 2, text: 'Sí, funciona perfecto ahora. ¡Gracias!', sentAt: new Date(now.getTime() - 4 * 24 * 3600 * 1000) },
    ]);
  }

  // User Management
  addUser(user: Omit<User, 'id'>): boolean {
    if (this.users().some(u => u.email === user.email)) {
      return false;
    }
    const newUser = { ...user, id: Date.now() };
    this.users.update(users => [...users, newUser]);
    return true;
  }
  
  // Category Management
  addCategory(category: Omit<Category, 'id'>): boolean {
      if (this.categories().some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
          return false;
      }
      const newCategory: Category = { ...category, id: Date.now() };
      this.categories.update(categories => [...categories, newCategory]);
      return true;
  }

  updateCategory(updatedCategory: Category): boolean {
    if (this.categories().some(c => c.name.toLowerCase() === updatedCategory.name.toLowerCase() && c.id !== updatedCategory.id)) {
      return false; // Name conflict
    }
    this.categories.update(categories => categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    return true;
  }

  deleteCategory(categoryId: number): boolean {
    // Prevent deletion if category is in use
    if (this.equipment().some(e => e.categoryId === categoryId)) {
      return false;
    }
    this.categories.update(categories => categories.filter(c => c.id !== categoryId));
    return true;
  }

  // Equipment Management
  addEquipment(equipment: Omit<Equipment, 'id' | 'status'>) {
    const newEquipment: Equipment = { ...equipment, id: Date.now(), status: 'Disponible' };
    this.equipment.update(equipments => [...equipments, newEquipment]);
  }

  updateEquipment(updatedEquipment: Equipment) {
    this.equipment.update(equipments => equipments.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
  }

  deleteEquipment(equipmentId: number) {
    this.equipment.update(equipments => equipments.filter(e => e.id !== equipmentId));
  }
  
  // Space Management
  addSpaceType(spaceType: Omit<SpaceType, 'id'>): boolean {
    if (this.spaceTypes().some(st => st.name.toLowerCase() === spaceType.name.toLowerCase())) {
        return false;
    }
    const newSpaceType: SpaceType = { ...spaceType, id: Date.now() };
    this.spaceTypes.update(spaceTypes => [...spaceTypes, newSpaceType]);
    return true;
  }
  
  updateSpaceType(updatedSpaceType: SpaceType): boolean {
    if (this.spaceTypes().some(st => st.name.toLowerCase() === updatedSpaceType.name.toLowerCase() && st.id !== updatedSpaceType.id)) {
      return false; // Name conflict
    }
    this.spaceTypes.update(spaceTypes => spaceTypes.map(st => st.id === updatedSpaceType.id ? updatedSpaceType : st));
    return true;
  }

  deleteSpaceType(spaceTypeId: number): boolean {
    // Prevent deletion if type is in use
    if (this.spaces().some(s => s.spaceTypeId === spaceTypeId)) {
      return false;
    }
    this.spaceTypes.update(spaceTypes => spaceTypes.filter(st => st.id !== spaceTypeId));
    return true;
  }

  addSpace(space: Omit<Space, 'id'>) {
    const newSpace: Space = { ...space, id: Date.now() };
    this.spaces.update(spaces => [...spaces, newSpace]);
  }

  updateSpace(updatedSpace: Space) {
    this.spaces.update(spaces => spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
  }

  deleteSpace(spaceId: number) {
    this.spaces.update(spaces => spaces.filter(s => s.id !== spaceId));
  }

  // Getters
  getCategory(id: number): Category | undefined { return this.categories().find(c => c.id === id); }
  getSpaceType(id: number): SpaceType | undefined { return this.spaceTypes().find(st => st.id === id); }
  getUserName(id: number): string { return this.users().find(u => u.id === id)?.fullName ?? 'Desconocido'; }
  getEquipmentName(id: number): string { return this.equipment().find(e => e.id === id)?.name ?? 'Desconocido'; }
  getSpaceName(id: number): string { return this.spaces().find(s => s.id === id)?.name ?? 'Desconocido'; }
  getResourceName(resource: { equipmentId?: number; spaceId?: number }): string {
    if (resource.equipmentId) return this.getEquipmentName(resource.equipmentId);
    if (resource.spaceId) return this.getSpaceName(resource.spaceId);
    return 'Recurso Desconocido';
  }

  // Reservation Management
  addReservation(reservation: Omit<Reservation, 'id' | 'status'>): boolean {
    let isConflict = false;
    if (reservation.equipmentId) {
        isConflict = this.reservations().some(r => r.equipmentId === reservation.equipmentId && r.status === 'Aprobada' && ((reservation.startTime >= r.startTime && reservation.startTime < r.endTime) || (reservation.endTime > r.startTime && reservation.endTime <= r.endTime)));
    } else if (reservation.spaceId) {
        isConflict = this.reservations().some(r => r.spaceId === reservation.spaceId && r.status === 'Aprobada' && ((reservation.startTime >= r.startTime && reservation.startTime < r.endTime) || (reservation.endTime > r.startTime && reservation.endTime <= r.endTime)));
    }
    if (isConflict) return false;
    const newReservation: Reservation = { ...reservation, id: Date.now(), status: 'Pendiente' };
    this.reservations.update(reservations => [...reservations, newReservation]);
    return true;
  }
  
  updateReservationStatus(id: number, status: ReservationStatus) {
    this.reservations.update(reservations => reservations.map(r => r.id === id ? { ...r, status } : r));
  }
  
  getReservationsForUser(userId: number): Reservation[] { return this.reservations().filter(r => r.solicitanteId === userId).sort((a,b) => b.startTime.getTime() - a.startTime.getTime()); }
  getReservationsForSpace(spaceId: number, startRange: Date, endRange: Date): Reservation[] { return this.reservations().filter(r => r.spaceId === spaceId && r.status === 'Aprobada' && r.startTime < endRange && r.endTime > startRange); }

  // Report Management
  addReport(reportData: Omit<Report, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Report {
    const now = new Date();
    const newReport: Report = {
      ...reportData,
      id: Date.now(),
      status: 'Abierto',
      createdAt: now,
      updatedAt: now,
    };
    this.reports.update(reports => [...reports, newReport]);
    return newReport;
  }

  addReportMessage(messageData: Omit<ReportMessage, 'id' | 'sentAt'>) {
    const newMessage: ReportMessage = {
      ...messageData,
      id: Date.now(),
      sentAt: new Date(),
    };
    this.reportMessages.update(messages => [...messages, newMessage]);
    this.reports.update(reports => reports.map(r => r.id === messageData.reportId ? { ...r, updatedAt: new Date() } : r));
  }
  
  updateReportStatus(reportId: number, status: ReportStatus) {
    this.reports.update(reports => reports.map(r => r.id === reportId ? { ...r, status, updatedAt: new Date() } : r));
  }
}