// Mock data for demonstration
export const mockAccounts = [
  {
    id: '1',
    type: 'bank',
    name: 'Cuenta Corriente',
    bank: 'Santander',
    lastDigits: '1234',
    balance: 1520.50,
    color: ['#0EA5A4', '#0D8F8E'],
  },
  {
    id: '2',
    type: 'bank',
    name: 'Ahorros Viaje',
    bank: 'BBVA',
    lastDigits: '5678',
    balance: 12300.00,
    color: ['#10B981', '#059669'],
  },
];

export const mockCreditCards = [
  {
    id: '1',
    name: 'Mastercard Gold',
    bank: 'Mastercard',
    lastDigits: '4321',
    balance: 2850.00,
    limit: 5000.00,
    color: ['#FB923C', '#F97316'],
  },
];

export const mockTransactions = [
  {
    id: '1',
    type: 'expense',
    category: 'supermercado',
    name: 'Supermercado',
    description: 'Compras de la semana',
    amount: -75.50,
    date: new Date(2025, 10, 27),
    account: 'Cuenta Corriente',
  },
  {
    id: '2',
    type: 'income',
    category: 'salario',
    name: 'Salario',
    description: 'Pago de Enero',
    amount: 1250.00,
    date: new Date(2025, 10, 26),
    account: 'Cuenta Corriente',
  },
  {
    id: '3',
    type: 'expense',
    category: 'restaurante',
    name: 'Restaurante La Casona',
    description: 'Cenas',
    amount: -62.00,
    date: new Date(2025, 10, 25),
    account: 'Mastercard Gold',
  },
];

export const mockBudgets = [
  {
    id: '1',
    category: 'comida',
    name: 'Comida',
    spent: 460,
    budget: 500,
    icon: 'food',
  },
  {
    id: '2',
    category: 'transporte',
    name: 'Transporte',
    spent: 40,
    budget: 100,
    icon: 'car',
  },
  {
    id: '3',
    category: 'ocio',
    name: 'Ocio',
    spent: 165,
    budget: 150,
    icon: 'game-controller',
  },
  {
    id: '4',
    category: 'hogar',
    name: 'Hogar',
    spent: 320,
    budget: 750,
    icon: 'home',
  },
];

export const mockCategoryExpenses = [
  { category: 'Hogar', amount: 690.28, percentage: 35, color: '#8B5CF6' },
  { category: 'Transporte', amount: 493.88, percentage: 25, color: '#3B82F6' },
  { category: 'Ocio', amount: 296.33, percentage: 15, color: '#EC4899' },
  { category: 'Comida', amount: 197.55, percentage: 10, color: '#F59E0B' },
  { category: 'Otros', amount: 197.46, percentage: 10, color: '#64748B' },
];

export const mockMonthlyData = [
  { month: 'Feb', income: 2850, expense: 1975 },
  { month: 'Mar', income: 3200, expense: 2100 },
  { month: 'Abr', income: 2950, expense: 1845 },
  { month: 'May', income: 3100, expense: 2300 },
  { month: 'Jun', income: 2850, expense: 1975 },
];
