export interface Budget {
  id?: number;
  name: string;
  description: string;
  presupuesto: number;
  cardId?: number;
  card?: {
    id: number;
    number: string;
    balance: string;
  };
  userIds: number[];
  porcentajeCumplido?: number; // 0 to 100
  montoGastado?: number; // Amount spent so far
  createdAt?: string;
}

export interface BudgetCreateData {
  name: string;
  description: string;
  presupuesto: number;
  cardId: number;
  userIds?: number[];
}

export interface BudgetUpdateData {
  name?: string;
  description?: string;
  presupuesto?: number;
  cardId?: number;
  userIds?: number[];
  porcentajeCumplido?: number; // 0 to 100
  montoGastado?: number; // Amount spent
}
