export interface Goal {
  id: number;
  name: string;
  description: string;
  type: 'gasto' | 'ahorro';
  amount: number;
  progreso: number;
  completed: boolean;
  presupuesto?: {
    id: number;
    name: string;
    presupuesto: number;
    card?: { id: number; number: string; balance: string };
  };
  card?: { id: number; number: string; balance: string };
  account?: { id: number; name: string; balance: string };
  users: any[];
}

export interface GoalCreateData {
  name: string;
  description: string;
  type: 'gasto' | 'ahorro';
  amount: number;
  presupuestoId?: number;
  cardId?: number;
  accountId?: number;
  userIds: number[];
}

export interface GoalUpdateData {
  name?: string;
  description?: string;
  type?: 'gasto' | 'ahorro';
  amount?: number;
  presupuestoId?: number;
  cardId?: number;
  accountId?: number;
  userIds?: number[];
  progreso?: number;
  completed?: boolean;
}
