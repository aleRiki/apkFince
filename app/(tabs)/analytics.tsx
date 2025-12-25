import LogoutButton from '@/components/LogoutButton';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Category color mapping for consistent colors across the app
const CATEGORY_COLORS: Record<string, string> = {
  rent: '#6366F1',
  food_groceries: '#EC4899',
  entertainment: '#8B5CF6',
  transportation: '#3B82F6',
  utilities_internet: '#10B981',
  utilities_electricity: '#F59E0B',
  utilities_phone: '#EF4444',
  shopping: '#F97316',
  health_care: '#14B8A6',
  debt_payment: '#64748B',
  other_expense: '#94A3B8',
};

interface Transaction {
  id: number;
  transactionType: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface Budget {
  id: string | number;
  category?: string;
  name: string;
  presupuesto: number; // límite del presupuesto desde backend
  amount?: number; // alias para compatibilidad
  spent?: number; // calculado
  porcentajeCumplido?: number; // desde backend
  icon?: string;
  color?: string;
}

interface Goal {
  id: string | number;
  name: string;
  description?: string;
  presupuesto?: {
    id: number;
    name: string;
    description: string;
    presupuesto: number;
    porcentajeCumplido: number;
  };
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
}

interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  name: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export default function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Financial Summary
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  // Charts Data
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // Trends
  const [incomeTrend, setIncomeTrend] = useState<number>(0);
  const [expenseTrend, setExpenseTrend] = useState<number>(0);
  const [balanceTrend, setBalanceTrend] = useState<number>(0);

  // Goals & Budgets
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedDate]);

  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (activeTab === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else if (activeTab === 'quarter') {
      const quarter = Math.floor(selectedDate.getMonth() / 3);
      start.setMonth(quarter * 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 3);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const getPeriodLabel = () => {
    if (activeTab === 'month') {
      return selectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    } else if (activeTab === 'quarter') {
      const quarter = Math.floor(selectedDate.getMonth() / 3) + 1;
      return `T${quarter} ${selectedDate.getFullYear()}`;
    } else {
      return selectedDate.getFullYear().toString();
    }
  };

  const handlePreviousPeriod = () => {
    const newDate = new Date(selectedDate);
    if (activeTab === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (activeTab === 'quarter') {
      newDate.setMonth(newDate.getMonth() - 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(selectedDate);
    if (activeTab === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (activeTab === 'quarter') {
      newDate.setMonth(newDate.getMonth() + 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setSelectedDate(newDate);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch data from all endpoints in parallel
      const [transactionsData, budgetsData, goalsData] = await Promise.all([
        api.get('/api/v1/transaction').catch(() => []),
        api.get('/api/v1/presupuesto').catch(() => []),
        api.get('/api/v1/metas').catch(() => [])
      ]);

      console.log('📊 Analytics Debug:');
      console.log('  Transactions:', transactionsData?.length || 0);
      console.log('  Budgets:', budgetsData?.length || 0);
      console.log('  Goals:', goalsData?.length || 0);

      // Filter valid transactions and normalize data
      const validTransactions = transactionsData
        .filter((tx: any) => tx && tx.amount)
        .map((tx: any) => ({
          ...tx,
          amount: parseFloat(tx.amount),
          date: tx.createAt ? new Date(tx.createAt) : (tx.date ? new Date(tx.date) : new Date()), // Use createAt from API
          transactionType: (tx.transactionType || '').toLowerCase()
        }));

      console.log('  Valid Transactions:', validTransactions.length);
      console.log('  Sample Transaction:', validTransactions[0]);

      const { start, end } = getDateRange();

      console.log('📅 Date Range:', {
        start: start.toISOString(),
        end: end.toISOString(),
        activeTab,
        selectedDate: selectedDate.toISOString()
      });

      const filteredTransactions = validTransactions.filter((tx: any) => {
        return tx.date >= start && tx.date <= end;
      });

      console.log('  Filtered Transactions:', filteredTransactions.length);
      if (filteredTransactions.length > 0) {
        console.log('  First Transaction Date:', filteredTransactions[0].date.toISOString());
      }
      if (validTransactions.length > 0 && filteredTransactions.length === 0) {
        console.log('  ⚠️ All transactions filtered out!');
        console.log('  Sample Transaction Date:', validTransactions[0].date.toISOString());
      }

      // Store budgets and goals from API
      const normalizedBudgets = budgetsData.map((b: any) => {
        const amount = parseFloat(b.presupuesto || b.amount || 0);
        const porcentaje = parseFloat(b.porcentajeCumplido || 0);
        return {
          ...b,
          amount: amount,
          presupuesto: amount,
          spent: (porcentaje / 100) * amount, // Use backend percentage if available
          color: b.color || CATEGORY_COLORS[b.category] || '#94A3B8'
        };
      });

      const normalizedGoals = goalsData.map((g: any) => {
        const target = parseFloat(g.presupuesto?.presupuesto || g.targetAmount || 0);
        const percent = parseFloat(g.presupuesto?.porcentajeCumplido || g.porcentajeCumplido || 0);
        return {
          ...g,
          targetAmount: target,
          savedAmount: (percent / 100) * target
        };
      });

      console.log('  Normalized Budgets:', normalizedBudgets.length);
      console.log('  Normalized Goals:', normalizedGoals.length);

      setBudgets(normalizedBudgets);
      setGoals(normalizedGoals);
      setTransactions(filteredTransactions);

      const { income, expenses, balance: currentBalance } = calculateFinancials(filteredTransactions);

      // Calculate Trends (Compare current filtered vs previous period)
      calculateTrends(validTransactions, start, end, income, expenses, currentBalance);

      calculateCategoryExpenses(filteredTransactions, normalizedBudgets);
      calculateMonthlyData(validTransactions);
      calculateBudgetSpending(validTransactions, normalizedBudgets);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancials = (txs: any[]) => {
    const income = txs
      .filter((tx: any) => tx.transactionType === 'deposit')
      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

    const expenses = txs
      .filter((tx: any) => tx.transactionType === 'withdraw')
      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

    const currentBalance = income - expenses;
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setBalance(currentBalance);

    return { income, expenses, balance: currentBalance };
  };

  const calculateTrends = (allTxs: any[], currentStart: Date, currentEnd: Date, currentIncome: number, currentExpenses: number, currentBalance: number) => {
    // Calculate duration of current period
    const durationMs = currentEnd.getTime() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - durationMs - 1);
    const prevEnd = new Date(currentStart.getTime() - 1);

    const prevTxs = allTxs.filter(tx => tx.date >= prevStart && tx.date <= prevEnd);

    const prevIncome = prevTxs
      .filter((tx: any) => tx.transactionType === 'deposit')
      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

    const prevExpenses = prevTxs
      .filter((tx: any) => tx.transactionType === 'withdraw')
      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

    const prevBalance = prevIncome - prevExpenses;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    setIncomeTrend(calculateChange(currentIncome, prevIncome));
    setExpenseTrend(calculateChange(currentExpenses, prevExpenses));
    setBalanceTrend(calculateChange(currentBalance, prevBalance));
  };

  const calculateCategoryExpenses = (txs: any[], budgetList: Budget[]) => {
    // Filter only withdraw transactions
    const expenses = txs.filter((tx: any) => tx.transactionType === 'withdraw');
    const totalExp = expenses.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

    console.log('💰 Calculating expenses:', {
      totalTransactions: txs.length,
      withdrawTransactions: expenses.length,
      totalExpenses: totalExp
    });

    if (totalExp === 0) {
      setCategoryExpenses([]);
      return;
    }

    // If we have budgets, use them as category reference
    // Otherwise, group expenses directly by category from transactions
    let grouped: CategoryExpense[] = [];

    if (budgetList.length > 0) {
      // Use budget list as category reference
      grouped = budgetList.map(budget => {
        const category = budget.category || 'other_expense';
        // If we have a category, we calculate from transactions. 
        // If not, we use the spent value we normalized from porcentajeCumplido.
        const amount = budget.category
          ? expenses
            .filter((tx: any) => tx.category === budget.category)
            .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0)
          : (budget.spent || 0);

        return {
          category,
          name: budget.name,
          amount,
          percentage: parseFloat(((amount / totalExp) * 100).toFixed(1)),
          color: budget.color || CATEGORY_COLORS[category] || '#94A3B8'
        };
      }).filter(item => item.amount >= 0).sort((a, b) => b.amount - a.amount);
    } else {
      // No budgets available, group directly from transactions
      const categoryMap = new Map<string, { amount: number, name: string }>();

      expenses.forEach((tx: any) => {
        const category = tx.category || 'other_expense';
        const current = categoryMap.get(category) || { amount: 0, name: category };
        current.amount += parseFloat(tx.amount);
        categoryMap.set(category, current);
      });

      // Convert map to array with proper formatting
      const categoryNames: Record<string, string> = {
        rent: 'Alquiler',
        food_groceries: 'Comida',
        entertainment: 'Entretenimiento',
        transportation: 'Transporte',
        utilities_internet: 'Internet',
        utilities_electricity: 'Electricidad',
        utilities_phone: 'Teléfono',
        shopping: 'Compras',
        health_care: 'Salud',
        debt_payment: 'Deudas',
        other_expense: 'Otros'
      };

      grouped = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category: category || 'other_expense',
        name: categoryNames[category] || category,
        amount: data.amount,
        percentage: parseFloat(((data.amount / totalExp) * 100).toFixed(1)),
        color: CATEGORY_COLORS[category || 'other_expense'] || '#94A3B8'
      })).sort((a, b) => b.amount - a.amount);
    }

    console.log('📊 Grouped expenses:', grouped.length, 'categories');
    setCategoryExpenses(grouped);
  };

  const calculateMonthlyData = (txs: any[]) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    const data = last6Months.map(date => {
      const monthStr = date.toLocaleString('es-ES', { month: 'short' });
      const monthTx = txs.filter((tx: any) => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
      });

      const income = monthTx
        .filter((tx: any) => tx.transactionType === 'deposit')
        .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

      const expense = monthTx
        .filter((tx: any) => tx.transactionType === 'withdraw')
        .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

      return { month: monthStr, income, expense };
    });

    setMonthlyData(data);
  };

  const calculateBudgetSpending = (txs: any[], budgetList: Budget[]) => {
    // Calculate spent amount for each budget
    const expenses = txs.filter((tx: any) => tx.transactionType === 'withdraw');
    const updatedBudgets = budgetList.map(b => {
      // If budget has a category, we can calculate spent from filtered transactions
      if (b.category) {
        const spent = expenses
          .filter((tx: any) => tx.category === b.category)
          .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);
        return { ...b, spent };
      }
      // If no category, keep the 'spent' we might have calculated from percentageCumplido
      return b;
    });
    setBudgets(updatedBudgets);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Informes y Análisis</Text>
        <LogoutButton />
      </View>

      {/* Period Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'month' && styles.activeTab]}
          onPress={() => setActiveTab('month')}
        >
          <Text style={[styles.tabText, activeTab === 'month' && styles.activeTabText]}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quarter' && styles.activeTab]}
          onPress={() => setActiveTab('quarter')}
        >
          <Text style={[styles.tabText, activeTab === 'quarter' && styles.activeTabText]}>Trimestre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'year' && styles.activeTab]}
          onPress={() => setActiveTab('year')}
        >
          <Text style={[styles.tabText, activeTab === 'year' && styles.activeTabText]}>Año</Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={handlePreviousPeriod} style={styles.navButton}>
          <Feather name="chevron-left" size={24} color={appTheme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.dateLabel}>{getPeriodLabel()}</Text>
        <TouchableOpacity onPress={handleNextPeriod} style={styles.navButton}>
          <Feather name="chevron-right" size={24} color={appTheme.colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Period Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Resumen del Período</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Ingresos Totales</Text>
                  {incomeTrend !== 0 && (
                    <View style={[styles.trendBadge, incomeTrend > 0 ? styles.trendUp : styles.trendDown]}>
                      <Feather name={incomeTrend > 0 ? "trending-up" : "trending-down"} size={10} color={incomeTrend > 0 ? appTheme.colors.success : appTheme.colors.error} />
                      <Text style={[styles.trendText, { color: incomeTrend > 0 ? appTheme.colors.success : appTheme.colors.error }]}>
                        {Math.abs(incomeTrend).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.summaryValue, styles.incomeText]}>{formatCurrency(totalIncome)}</Text>
              </View>

              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Gastos Totales</Text>
                  {expenseTrend !== 0 && (
                    <View style={[styles.trendBadge, expenseTrend < 0 ? styles.trendUp : styles.trendDown]}>
                      <Feather name={expenseTrend < 0 ? "trending-down" : "trending-up"} size={10} color={expenseTrend < 0 ? appTheme.colors.success : appTheme.colors.error} />
                      <Text style={[styles.trendText, { color: expenseTrend < 0 ? appTheme.colors.success : appTheme.colors.error }]}>
                        {Math.abs(expenseTrend).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.summaryValue, styles.expenseText]}>{formatCurrency(totalExpenses)}</Text>
              </View>

              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Balance</Text>
                  {balanceTrend !== 0 && (
                    <View style={[styles.trendBadge, balanceTrend > 0 ? styles.trendUp : styles.trendDown]}>
                      <Feather name={balanceTrend > 0 ? "trending-up" : "trending-down"} size={10} color={balanceTrend > 0 ? appTheme.colors.success : appTheme.colors.error} />
                      <Text style={[styles.trendText, { color: balanceTrend > 0 ? appTheme.colors.success : appTheme.colors.error }]}>
                        {Math.abs(balanceTrend).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.summaryValue, balance >= 0 ? styles.incomeText : styles.expenseText]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>
          </View>

          {/* Balance Chart - By Category */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transacciones por Categoría</Text>

            {transactions.length > 0 ? (
              <>
                <View style={styles.donutChartWrapper}>
                  {/* Background Ring */}
                  <View style={styles.donutBackgroundRing} />

                  {/* Cumulative Segments (Simulated with progress bars/arcs) */}
                  <View style={styles.chartVisualContainer}>
                    <View style={[styles.mainProgressCircle, {
                      borderColor: balance >= 0 ? appTheme.colors.success : appTheme.colors.error,
                      borderRightColor: 'transparent',
                      borderBottomColor: 'transparent',
                      transform: [{ rotate: '45deg' }]
                    }]} />
                  </View>

                  <View style={styles.donutCenter}>
                    <Text style={styles.donutCenterLabel}>Balance Neto</Text>
                    <Text style={[
                      styles.donutCenterValue,
                      { color: balance >= 0 ? appTheme.colors.success : appTheme.colors.error }
                    ]}>
                      {formatCurrency(balance)}
                    </Text>

                    {balanceTrend !== 0 && (
                      <View style={[styles.centerTrendBadge, balanceTrend > 0 ? styles.trendUp : styles.trendDown]}>
                        <Feather
                          name={balanceTrend > 0 ? "arrow-up-right" : "arrow-down-right"}
                          size={14}
                          color={balanceTrend > 0 ? appTheme.colors.success : appTheme.colors.error}
                        />
                        <Text style={[styles.centerTrendText, { color: balanceTrend > 0 ? appTheme.colors.success : appTheme.colors.error }]}>
                          {Math.abs(balanceTrend).toFixed(1)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.legend}>
                  {(() => {
                    const categoryMap = new Map<string, { amount: number, type: string }>();
                    const categoryNames: Record<string, string> = {
                      salary: 'Salario',
                      investment: 'Inversiones',
                      bonus: 'Bonos',
                      rent: 'Alquiler',
                      food_groceries: 'Comida',
                      entertainment: 'Entretenimiento',
                      transportation: 'Transporte',
                      utilities_internet: 'Internet',
                      utilities_electricity: 'Electricidad',
                      utilities_phone: 'Teléfono',
                      shopping: 'Compras',
                      health_care: 'Salud',
                      debt_payment: 'Deudas',
                      other_expense: 'Otros Gastos'
                    };

                    const categoryColors: Record<string, string> = {
                      salary: '#10B981',
                      investment: '#059669',
                      bonus: '#34D399',
                      ...CATEGORY_COLORS
                    };

                    transactions.forEach((tx: any) => {
                      const category = tx.category || 'other_expense';
                      const current = categoryMap.get(category) || { amount: 0, type: tx.transactionType };
                      current.amount += parseFloat(tx.amount);
                      categoryMap.set(category, current);
                    });

                    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);
                    return Array.from(categoryMap.entries())
                      .map(([category, data]) => ({
                        category,
                        name: categoryNames[category] || category,
                        amount: data.amount,
                        percentage: ((data.amount / total) * 100).toFixed(1),
                        color: data.type === 'deposit' ? appTheme.colors.success : appTheme.colors.error,
                        type: data.type
                      }))
                      .sort((a, b) => b.amount - a.amount)
                      .map((cat, index) => (
                        <View key={index} style={styles.financialIndicator}>
                          <View style={styles.indicatorHeader}>
                            <View style={styles.indicatorLeft}>
                              <View style={[styles.indicatorDot, { backgroundColor: cat.color }]} />
                              <View>
                                <Text style={styles.indicatorName}>{cat.name}</Text>
                                <Text style={styles.indicatorType}>
                                  {cat.type === 'deposit' ? 'Ingreso' : 'Gasto'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.indicatorRight}>
                              <Text style={[
                                styles.indicatorAmount,
                                { color: cat.type === 'deposit' ? appTheme.colors.success : appTheme.colors.error }
                              ]}>
                                {cat.type === 'deposit' ? '+' : '-'}{formatCurrency(cat.amount)}
                              </Text>
                              <Text style={styles.indicatorPercentage}>{cat.percentage}%</Text>
                            </View>
                          </View>
                          <View style={styles.indicatorProgressBar}>
                            <View style={[
                              styles.indicatorProgress,
                              {
                                width: `${cat.percentage}%` as any,
                                backgroundColor: cat.color
                              }
                            ]} />
                          </View>
                        </View>
                      ));
                  })()}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>No hay transacciones en este período</Text>
            )}
          </View>

          {/* Goals Compliance */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cumplimiento de Metas</Text>
            {goals.length > 0 ? (
              <>
                <View style={styles.goalsSummary}>
                  {(() => {
                    const total = goals.length;
                    const completed = goals.filter(g => g.savedAmount >= g.targetAmount).length;
                    const pending = total - completed;
                    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
                    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
                    const totalPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

                    return (
                      <>
                        <View style={styles.goalsSummaryHeader}>
                          <View style={styles.goalsSummaryItem}>
                            <Text style={styles.goalsSummaryValue}>{total}</Text>
                            <Text style={styles.goalsSummaryLabel}>Metas Totales</Text>
                          </View>
                          <View style={styles.goalsSummaryVerticalLine} />
                          <View style={styles.goalsSummaryItem}>
                            <Text style={[styles.goalsSummaryValue, { color: appTheme.colors.success }]}>{completed}</Text>
                            <Text style={styles.goalsSummaryLabel}>Cumplidas</Text>
                          </View>
                          <View style={styles.goalsSummaryVerticalLine} />
                          <View style={styles.goalsSummaryItem}>
                            <Text style={[styles.goalsSummaryValue, { color: appTheme.colors.warning || '#F59E0B' }]}>{pending}</Text>
                            <Text style={styles.goalsSummaryLabel}>Pendientes</Text>
                          </View>
                        </View>

                        <View style={styles.goalsTotalProgress}>
                          <View style={styles.goalsTotalProgressHeader}>
                            <Text style={styles.goalsTotalProgressLabel}>Progreso Total</Text>
                            <Text style={styles.goalsTotalProgressValue}>{totalPercent.toFixed(1)}%</Text>
                          </View>
                          <View style={styles.goalsTotalProgressBar}>
                            <View style={[styles.goalsTotalProgressFill, { width: `${totalPercent}%` }]} />
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </View>

                {goals.map(goal => {
                  const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
                  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
                  const isCompleted = progress >= 100;

                  return (
                    <View key={goal.id} style={styles.goalItem}>
                      <View style={styles.goalHeader}>
                        <View style={[styles.goalIcon, isCompleted && styles.goalIconCompleted]}>
                          <Feather
                            name={(goal.icon || 'target') as any}
                            size={18}
                            color={isCompleted ? appTheme.colors.success : appTheme.colors.primary}
                          />
                        </View>
                        <View style={styles.goalInfo}>
                          <Text style={styles.goalName}>{goal.name}</Text>
                          <View style={styles.goalAmounts}>
                            <Text style={styles.goalSaved}>{formatCurrency(goal.savedAmount)}</Text>
                            <Text style={styles.goalSeparator}>/</Text>
                            <Text style={styles.goalTarget}>{formatCurrency(goal.targetAmount)}</Text>
                          </View>
                        </View>
                        <Text style={[styles.goalPercent, isCompleted && styles.goalPercentCompleted]}>
                          {progress.toFixed(0)}%
                        </Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, isCompleted && styles.progressBarCompleted]}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${progress}%`,
                                backgroundColor: isCompleted ? appTheme.colors.success : appTheme.colors.primary
                              }
                            ]}
                          />
                        </View>
                      </View>
                      {!isCompleted && remaining > 0 && (
                        <Text style={styles.goalRemaining}>
                          Faltan {formatCurrency(remaining)} para alcanzar la meta
                        </Text>
                      )}
                      {isCompleted && (
                        <Text style={styles.goalCompletedText}>
                          ¡Meta Completada! 🎉
                        </Text>
                      )}
                    </View>
                  );
                })}
              </>
            ) : (
              <Text style={styles.emptyText}>No hay metas configuradas</Text>
            )}
          </View>

          {/* Budget Analysis - Comparative Bar Chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Análisis de Presupuesto</Text>
            {budgets.filter(b => (b.spent || 0) > 0).length > 0 ? (
              <>
                {/* Bar Chart */}
                <View style={styles.budgetChartContainer}>
                  {budgets.filter(b => (b.spent || 0) > 0).map(budget => {
                    const spent = budget.spent || 0;
                    const limit = budget.amount || 0;
                    const maxValue = Math.max(...budgets.filter(b => (b.spent || 0) > 0).map(b => Math.max(b.spent || 0, b.amount || 0)));
                    const spentHeight = (spent / maxValue) * 120;
                    const limitHeight = (limit / maxValue) * 120;
                    const isOverBudget = spent > limit;
                    const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

                    return (
                      <View key={budget.id} style={styles.budgetBarGroup}>
                        <View style={styles.budgetBars}>
                          <View style={styles.budgetBarPair}>
                            <View style={styles.budgetBarContainer}>
                              <View
                                style={[
                                  styles.budgetBar,
                                  styles.budgetBarSpent,
                                  {
                                    height: Math.max(spentHeight, 4),
                                    backgroundColor: isOverBudget ? appTheme.colors.error : (budget.color || '#94A3B8')
                                  }
                                ]}
                              />
                              <Text style={styles.budgetBarLabel}>Gastado</Text>
                            </View>
                            <View style={styles.budgetBarContainer}>
                              <View
                                style={[
                                  styles.budgetBar,
                                  styles.budgetBarLimit,
                                  {
                                    height: Math.max(limitHeight, 4),
                                    backgroundColor: 'rgba(148, 163, 184, 0.3)'
                                  }
                                ]}
                              />
                              <Text style={styles.budgetBarLabel}>Límite</Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.budgetCategoryName} numberOfLines={1}>{budget.name}</Text>
                        <Text style={[styles.budgetPercentage, isOverBudget && styles.overBudgetText]}>
                          {progress.toFixed(0)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Budget Details List */}
                <View style={styles.budgetDetailsList}>
                  {budgets.filter(b => (b.spent || 0) > 0).map(budget => {
                    const spent = budget.spent || 0;
                    const limit = budget.amount || 0;
                    const remaining = Math.max(0, limit - spent);
                    const isOverBudget = spent > limit;

                    return (
                      <View key={budget.id} style={styles.budgetDetailItem}>
                        <View style={styles.budgetDetailHeader}>
                          <View style={[styles.budgetColorDot, { backgroundColor: budget.color || '#94A3B8' }]} />
                          <Text style={styles.budgetDetailName}>{budget.name}</Text>
                        </View>
                        <View style={styles.budgetDetailAmounts}>
                          <Text style={styles.budgetDetailSpent}>
                            {formatCurrency(spent)}
                          </Text>
                          <Text style={styles.budgetDetailSeparator}>/</Text>
                          <Text style={styles.budgetDetailLimit}>
                            {formatCurrency(limit)}
                          </Text>
                        </View>
                        <Text style={[styles.budgetDetailRemaining, isOverBudget && styles.overBudget]}>
                          {isOverBudget ? 'Excedido: ' : 'Disponible: '}
                          {formatCurrency(Math.abs(remaining))}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>No hay gastos registrados para analizar</Text>
            )}
          </View>

          {/* Candlestick Chart (Monthly Evolution) */}
          <View style={styles.card}>
            <View style={styles.chartTitleContainer}>
              <Text style={styles.cardTitle}>Evolución Mensual</Text>
              <View style={styles.chartBadge}>
                <Text style={styles.chartBadgeText}>Estilo Financiero</Text>
              </View>
            </View>

            <View style={styles.candleChart}>
              <View style={styles.candleChartValues}>
                {(() => {
                  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1);
                  // Scale with symmetric axes (Top for income, Bottom for expense)
                  return [maxVal, maxVal / 2, 0, -maxVal / 2, -maxVal].map((v, i) => (
                    <Text key={i} style={styles.yAxisLabel}>{formatCurrency(v)}</Text>
                  ));
                })()}
              </View>

              <View style={styles.candleContainer}>
                {/* Horizontal Grid Lines */}
                <View style={styles.candleGrid}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.candleGridLine, i === 2 && styles.candleGridBaseline]} />
                  ))}
                </View>

                {monthlyData.map((data, index) => {
                  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 100);
                  // Height scale (half of available 140px, so 70px max for each direction)
                  const scale = 70 / maxValue;

                  const incomeHeight = data.income * scale;
                  const expenseHeight = data.expense * scale;

                  return (
                    <View key={index} style={styles.candleGroup}>
                      <View style={styles.candleTrack}>
                        {/* Income Candle (Upward) */}
                        <View style={[
                          styles.candleBody,
                          {
                            height: Math.max(incomeHeight, 2),
                            bottom: 70, // Baseline center
                            backgroundColor: appTheme.colors.success,
                            shadowColor: appTheme.colors.success,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.4,
                            shadowRadius: 3,
                            elevation: 4,
                          }
                        ]} />
                        {/* Expense Candle (Downward) */}
                        <View style={[
                          styles.candleBody,
                          {
                            height: Math.max(expenseHeight, 2),
                            top: 70, // Baseline center
                            backgroundColor: appTheme.colors.error,
                            shadowColor: appTheme.colors.error,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.4,
                            shadowRadius: 3,
                            elevation: 4,
                          }
                        ]} />
                      </View>
                      <Text style={styles.candleLabel}>{data.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: appTheme.colors.success }]} />
                <Text style={styles.chartLegendText}>Ingresos (+)</Text>
              </View>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: appTheme.colors.error }]} />
                <Text style={styles.chartLegendText}>Gastos (-)</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: appTheme.colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: appTheme.colors.backgroundCard,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: appTheme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.textSecondary,
  },
  activeTabText: {
    color: '#FFF',
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: appTheme.colors.backgroundCard,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.text,
    minWidth: 150,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  container: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  incomeText: {
    color: appTheme.colors.success,
  },
  expenseText: {
    color: appTheme.colors.error,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  donutContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  donutChartWrapper: {
    height: 200,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
    alignSelf: 'center',
  },
  donutBackgroundRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 12,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  chartVisualContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainProgressCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 12,
    borderColor: 'transparent',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  donutCenterLabel: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  donutCenterValue: {
    fontSize: 22,
    fontWeight: '900',
    color: appTheme.colors.text,
    marginVertical: 4,
  },
  centerTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  centerTrendText: {
    fontSize: 12,
    fontWeight: '800',
  },
  legend: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: appTheme.colors.text,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: appTheme.colors.textSecondary,
    marginRight: 12,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  barChart: {
    marginVertical: 20,
  },
  barChartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 180,
    alignItems: 'flex-end',
  },
  barGroup: {
    alignItems: 'center',
    gap: 8,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 16,
    borderRadius: 4,
  },
  incomeBar: {
    backgroundColor: appTheme.colors.success,
  },
  expenseBar: {
    backgroundColor: appTheme.colors.error,
  },
  barLabel: {
    fontSize: 11,
    color: appTheme.colors.textSecondary,
    marginTop: 4,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartBadge: {
    backgroundColor: 'rgba(14, 165, 164, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: appTheme.colors.primary,
    textTransform: 'uppercase',
  },
  candleChart: {
    flexDirection: 'row',
    marginVertical: 10,
    height: 200,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  candleChartValues: {
    justifyContent: 'space-between',
    paddingRight: 12,
    height: 140,
    zIndex: 10,
  },
  yAxisLabel: {
    fontSize: 8,
    color: appTheme.colors.textSecondary,
    textAlign: 'right',
    fontWeight: '600',
  },
  candleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    position: 'relative',
  },
  candleGrid: {
    position: 'absolute',
    width: '100%',
    height: 140,
    justifyContent: 'space-between',
  },
  candleGridLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
  },
  candleGroup: {
    alignItems: 'center',
    flex: 1,
    zIndex: 5,
  },
  candleTrack: {
    width: 24,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  candleGridBaseline: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    height: 1.5,
  },
  candleWick: {
    width: 1.5,
    position: 'absolute',
    borderRadius: 1,
    opacity: 0.3,
  },
  candleBody: {
    width: 8,
    borderRadius: 1.5,
    position: 'absolute',
    zIndex: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  candleLabel: {
    fontSize: 10,
    color: appTheme.colors.textSecondary,
    marginTop: 8,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    paddingBottom: 10, // Ensure dots are not cut off
    flexWrap: 'wrap',
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chartLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartLegendText: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: appTheme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 165, 164, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: appTheme.colors.text,
  },
  goalAmount: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: appTheme.colors.primary,
    borderRadius: 4,
  },
  goalPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: appTheme.colors.textSecondary,
    textAlign: 'right',
  },
  // New Goal Styles
  goalInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  goalIconCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  goalSaved: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  goalSeparator: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginHorizontal: 4,
  },
  goalTarget: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  goalPercentCompleted: {
    color: appTheme.colors.success,
  },
  progressBarContainer: {
    marginVertical: 8,
  },
  progressBarCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  goalRemaining: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  goalCompletedText: {
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.success,
    marginTop: 4,
  },
  budgetItem: {
    marginBottom: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '600',
    color: appTheme.colors.text,
  },
  budgetRemaining: {
    fontSize: 14,
    color: appTheme.colors.success,
    fontWeight: '600',
  },
  overBudget: {
    color: appTheme.colors.error,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  budgetSpent: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  budgetLimit: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  // New Budget Chart Styles
  budgetChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 8,
  },
  budgetBarGroup: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 80,
  },
  budgetBars: {
    height: 140,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  budgetBarPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  budgetBarContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 140,
  },
  budgetBar: {
    width: 20,
    borderRadius: 6,
    minHeight: 4,
  },
  budgetBarSpent: {
    // Specific styling for spent bar if needed
  },
  budgetBarLimit: {
    borderWidth: 2,
    borderColor: appTheme.colors.textSecondary,
    borderStyle: 'dashed',
  },
  budgetBarLabel: {
    fontSize: 9,
    color: appTheme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  budgetCategoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: appTheme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  budgetPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: appTheme.colors.success,
  },
  overBudgetText: {
    color: appTheme.colors.error,
  },
  budgetDetailsList: {
    marginTop: 16,
    gap: 12,
  },
  budgetDetailItem: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  budgetDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  budgetDetailName: {
    fontSize: 14,
    fontWeight: '600',
    color: appTheme.colors.text,
    flex: 1,
  },
  budgetDetailAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  budgetDetailSpent: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  budgetDetailSeparator: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginHorizontal: 6,
  },
  budgetDetailLimit: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  budgetDetailRemaining: {
    fontSize: 12,
    color: appTheme.colors.success,
    fontWeight: '600',
  },
  // Financial Indicator Styles
  financialIndicator: {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  indicatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 2,
  },
  indicatorType: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  indicatorRight: {
    alignItems: 'flex-end',
  },
  indicatorAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  indicatorPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.textSecondary,
  },
  indicatorProgressBar: {
    height: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  indicatorProgress: {
    height: '100%',
    borderRadius: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  trendUp: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  trendDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Goals Analysis Summary Styles
  goalsSummary: {
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  goalsSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalsSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  goalsSummaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: appTheme.colors.text,
  },
  goalsSummaryLabel: {
    fontSize: 10,
    color: appTheme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalsSummaryVerticalLine: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  goalsTotalProgress: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  goalsTotalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalsTotalProgressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.text,
  },
  goalsTotalProgressValue: {
    fontSize: 14,
    fontWeight: '800',
    color: appTheme.colors.primary,
  },
  goalsTotalProgressBar: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalsTotalProgressFill: {
    height: '100%',
    backgroundColor: appTheme.colors.primary,
  },
});
