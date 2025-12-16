

export type UserRole = 'Admin' | 'Docente';
export type ReservationStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';
export type EquipmentStatus = 'Disponible' | 'Reservado';
export type ReportStatus = 'Abierto' | 'En Proceso' | 'Cerrado';

export interface User {
  id: number;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Equipment {
  id: number;
  name: string;
  uniqueIdentifier: string;
  description: string;
  categoryId: number;
  status: EquipmentStatus;
  imageUrl?: string;
}

export interface Reservation {
  id: number;
  equipmentId?: number;
  spaceId?: number;
  solicitanteId: number;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
}

export interface SpaceType {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Space {
  id: number;
  name: string;
  spaceTypeId: number;
  description: string;
  capacity: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  solicitanteId: number;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  equipmentId?: number;
  spaceId?: number;
}

export interface ReportMessage {
  id: number;
  reportId: number;
  authorId: number;
  text: string;
  sentAt: Date;
}
