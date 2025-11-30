// App-specific theme for financial management
export const appTheme = {
  colors: {
    primary: '#0EA5A4',
    primaryDark: '#0D8F8E',
    accent: '#10B981',
    accentDark: '#059669',
    background: '#0F172A',
    backgroundCard: '#1E293B',
    backgroundLight: '#F8FAFC',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textDark: '#0F172A',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  categoryColors: {
    comida: '#F59E0B',
    transporte: '#3B82F6',
    ocio: '#EC4899',
    hogar: '#8B5CF6',
    otros: '#64748B',
    salario: '#10B981',
    supermercado: '#EF4444',
    restaurante: '#F97316',
  },
  
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  borderRadius: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  }
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

export const getPercentage = (value: number, total: number): number => {
  return total === 0 ? 0 : Math.round((value / total) * 100);
};
