import { Budget } from './budget';

export interface Goal {
  id: number;
  name: string;
  description: string;
  presupuesto: Budget; // Nested budget object from API
  users: any[];
  progreso?: number; // 0-100 completion percentage
  createdAt?: string;
}

export interface GoalCreateData {
  name: string;
  description: string;
  presupuestoId: number;
  userIds: number[];
}

export interface GoalUpdateData {
  name?: string;
  description?: string;
  userIds?: number[];
  progreso?: number; // 0-100
}
