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

// Shared configuration (should be in a config file in a real app)
const INITIAL_BUDGETS = [
  { id: '1', category: 'rent', name: 'Alquiler', spent: 0, budget: 800, icon: 'home', color: '#6366F1' },
  { id: '2', category: 'food_groceries', name: 'Comida', spent: 0, budget: 400, icon: 'shopping-cart', color: '#EC4899' },
  { id: '3', category: 'entertainment', name: 'Entretenimiento', spent: 0, budget: 150, icon: 'film', color: '#8B5CF6' },
  { id: '4', category: 'transportation', name: 'Transporte', spent: 0, budget: 100, icon: 'truck', color: '#3B82F6' },
  { id: '5', category: 'utilities_internet', name: 'Internet', spent: 0, budget: 50, icon: 'wifi', color: '#10B981' },
  { id: '6', category: 'utilities_electricity', name: 'Electricidad', spent: 0, budget: 80, icon: 'zap', color: '#F59E0B' },
  { id: '7', category: 'utilities_phone', name: 'Teléfono', spent: 0, budget: 40, icon: 'phone', color: '#EF4444' },
  { id: '8', category: 'shopping', name: 'Compras', spent: 0, budget: 200, icon: 'shopping-bag', color: '#F97316' },
  { id: '9', category: 'health_care', name: 'Salud', spent: 0, budget: 100, icon: 'heart', color: '#14B8A6' },
  { id: '10', category: 'debt_payment', name: 'Deudas', spent: 0, budget: 300, icon: 'credit-card', color: '#64748B' },
  { id: '11', category: 'other_expense', name: 'Otros', spent: 0, budget: 100, icon: 'more-horizontal', color: '#94A3B8' },
];

const INITIAL_GOALS = [
  { id: '1', name: 'Fondo de Emergencia', targetAmount: 10000, savedAmount: 0, icon: 'umbrella' },
  { id: '2', name: 'Vacaciones 2026', targetAmount: 5000, savedAmount: 0, icon: 'sun' },
];

interface Transaction {
  id: number;
  transactionType: string;
  amount: number;
  description: string;
  category: string;
  date: string;
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
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Financial Summary
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  // Charts Data
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // Goals & Budgets
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/v1/transaction');

      // Filter valid transactions and normalize data
      const validTransactions = data
        .filter((tx: any) => tx && tx.amount)
        .map((tx: any) => ({
          ...tx,
          amount: parseFloat(tx.amount),
          date: tx.date ? new Date(tx.date) : new Date(), // Fallback to now if date is missing
          transactionType: (tx.transactionType || '').toLowerCase()
        }));

      // Process data based on active tab (filtering by date)
      const now = new Date();
      let startDate = new Date();

      if (activeTab === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (activeTab === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const filteredTransactions = validTransactions.filter((tx: any) => {
        return tx.date >= startDate && tx.date <= now;
      });

      setTransactions(filteredTransactions);
      calculateFinancials(filteredTransactions);
      calculateCategoryExpenses(filteredTransactions);
      calculateMonthlyData(validTransactions); // Use all data for trend
      calculateGoalsAndBudgets(validTransactions); // Use all data for total status

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

    setTotalIncome(income);
    setTotalExpenses(expenses);
    setBalance(income - expenses);
  };

  const calculateCategoryExpenses = (txs: any[]) => {
    const expenses = txs.filter((tx: any) => tx.transactionType === 'withdraw');
    const totalExp = expenses.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

    if (totalExp === 0) {
      setCategoryExpenses([]);
      return;
    }

    const grouped = INITIAL_BUDGETS.map(budget => {
      const amount = expenses
        .filter((tx: any) => tx.category === budget.category)
        .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

      return {
        category: budget.category,
        name: budget.name,
        amount,
        percentage: parseFloat(((amount / totalExp) * 100).toFixed(1)),
        color: budget.color || '#94A3B8'
      };
    }).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);

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

  const calculateGoalsAndBudgets = (txs: any[]) => {
    // Calculate Budgets
    const expenses = txs.filter((tx: any) => tx.transactionType === 'withdraw');
    const updatedBudgets = INITIAL_BUDGETS.map(b => {
      const spent = expenses
        .filter((tx: any) => tx.category === b.category)
        .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);
      return { ...b, spent };
    });
    setBudgets(updatedBudgets);

    // Calculate Goals (Waterfall)
    const income = txs
      .filter((tx: any) => tx.transactionType === 'deposit')
      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

    let remainingIncome = income;
    const updatedGoals = INITIAL_GOALS.map(goal => {
      const amountForThisGoal = Math.min(remainingIncome, goal.targetAmount);
      remainingIncome = Math.max(0, remainingIncome - amountForThisGoal);
      return { ...goal, savedAmount: amountForThisGoal };
    });
    setGoals(updatedGoals);
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
                <Text style={styles.summaryLabel}>Ingresos Totales</Text>
                <Text style={[styles.summaryValue, styles.incomeText]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Gastos Totales</Text>
                <Text style={[styles.summaryValue, styles.expenseText]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Balance</Text>
                <Text style={[styles.summaryValue, balance >= 0 ? styles.incomeText : styles.expenseText]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>
          </View>

          {/* Donut Chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gastos por Categoría</Text>

            {categoryExpenses.length > 0 ? (
              <>
                <View style={styles.donutContainer}>
                  <View style={styles.donutChart}>
                    {categoryExpenses.map((cat, index) => (
                      <View key={index} style={styles.donutSegment}>
                        <View style={[styles.donutBar, { backgroundColor: cat.color, height: `${cat.percentage}%` }]} />
                      </View>
                    ))}
                  </View>

                  <View style={styles.donutCenter}>
                    <Text style={styles.donutCenterLabel}>Total</Text>
                    <Text style={styles.donutCenterValue}>{formatCurrency(totalExpenses)}</Text>
                  </View>
                </View>

                <View style={styles.legend}>
                  {categoryExpenses.map((cat, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.legendLabel}>{cat.name}</Text>
                      <Text style={styles.legendValue}>{cat.percentage}%</Text>
                      <Text style={styles.legendAmount}>{formatCurrency(cat.amount)}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>No hay gastos en este período</Text>
            )}
          </View>

          {/* Goals Compliance */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cumplimiento de Metas</Text>
            {goals.map(goal => {
              const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
              return (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalIcon}>
                      <Feather name={goal.icon as any} size={16} color={appTheme.colors.primary} />
                    </View>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmount}>{formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.goalPercent}>{progress.toFixed(1)}%</Text>
                </View>
              );
            })}
          </View>

          {/* Budget Analysis */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Análisis de Presupuesto</Text>
            {budgets.filter(b => b.spent > 0).map(budget => {
              const progress = Math.min((budget.spent / budget.budget) * 100, 100);
              const remaining = Math.max(0, budget.budget - budget.spent);
              const isOverBudget = budget.spent > budget.budget;

              return (
                <View key={budget.id} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetName}>{budget.name}</Text>
                    <Text style={[styles.budgetRemaining, isOverBudget && styles.overBudget]}>
                      {isOverBudget ? 'Excedido: ' : 'Disponible: '}
                      {formatCurrency(Math.abs(remaining))}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: isOverBudget ? appTheme.colors.error : budget.color
                        }
                      ]}
                    />
                  </View>
                  <View style={styles.budgetFooter}>
                    <Text style={styles.budgetSpent}>Gastado: {formatCurrency(budget.spent)}</Text>
                    <Text style={styles.budgetLimit}>Límite: {formatCurrency(budget.budget)}</Text>
                  </View>
                </View>
              );
            })}
            {budgets.filter(b => b.spent > 0).length === 0 && (
              <Text style={styles.emptyText}>No hay gastos registrados para analizar</Text>
            )}
          </View>

          {/* Bar Chart (Monthly Evolution) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Evolución Mensual</Text>

            <View style={styles.barChart}>
              <View style={styles.barChartBars}>
                {monthlyData.map((data, index) => {
                  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 100);
                })}
              </View>
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: appTheme.colors.success }]} />
                <Text style={styles.chartLegendText}>Ingresos</Text>
              </View>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: appTheme.colors.error }]} />
                <Text style={styles.chartLegendText}>Gastos</Text>
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
  donutChart: {
    flexDirection: 'row',
    height: 160,
    width: 160,
    borderRadius: 80,
    overflow: 'hidden',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  donutSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  donutBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  donutCenterValue: {
    fontSize: 20,
    fontWeight: '900',
    color: appTheme.colors.text,
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
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    textAlign: 'right',
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
});
