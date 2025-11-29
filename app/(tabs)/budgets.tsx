import CreateTransactionModal from '@/components/CreateTransactionModal';
import LogoutButton from '@/components/LogoutButton';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { mockBudgets } from '@/constants/mockData';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mapping from API categories to Mock Budget categories
const CATEGORY_MAPPING: Record<string, string> = {
  'food_groceries': 'comida',
  'transportation': 'transporte',
  'entertainment': 'ocio',
  'rent': 'hogar',
  'utilities_electricity': 'hogar',
  'utilities_phone': 'hogar',
  'utilities_internet': 'hogar',
  'shopping': 'comida', // Mapping shopping to food/general for now or maybe create a new budget?
};

interface Transaction {
  id: number;
  transactionType: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export default function BudgetsScreen() {
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [budgets, setBudgets] = useState(mockBudgets);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/v1/transaction');

      // Filter only expenses (withdraw)
      const expenses = data
        .filter((tx: any) => tx.transactionType === 'withdraw')
        .map((tx: any) => ({
          id: tx.id,
          transactionType: tx.transactionType,
          amount: parseFloat(tx.amount),
          description: tx.description || tx.notes || 'Gasto',
          category: tx.category,
          date: tx.date,
        }));

      setTransactions(expenses);
      calculateBudgets(expenses);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgets = (expenses: Transaction[]) => {
    // Reset spent amounts
    const newBudgets = mockBudgets.map(b => ({ ...b, spent: 0 }));

    expenses.forEach(tx => {
      const budgetCategory = CATEGORY_MAPPING[tx.category];
      if (budgetCategory) {
        const budgetIndex = newBudgets.findIndex(b => b.category === budgetCategory);
        if (budgetIndex !== -1) {
          newBudgets[budgetIndex].spent += tx.amount;
        }
      }
    });

    setBudgets(newBudgets);
  };

  const handleCreateTransaction = async (transactionData: any) => {
    try {
      await api.post('/api/v1/transaction', transactionData);
      // Refresh data
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error al crear la transacción');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate progress for the summary card
  // Note: totalSpent might exceed totalBudget if there are expenses not in budgets, 
  // but for the visual we might want to cap it or show the real percentage.
  const progressPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Presupuestos</Text>
        <LogoutButton />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budgets' && styles.activeTab]}
          onPress={() => setActiveTab('budgets')}
        >
          <Text style={[styles.tabText, activeTab === 'budgets' && styles.activeTabText]}>
            Presupuestos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => setActiveTab('goals')}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
            Metas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'budgets' && (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Gastado Por Mes</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
              </Text>
              <Text style={styles.summarySubtext}>
                {progressPercentage.toFixed(0)}% del presupuesto para este mes
              </Text>
            </View>

            {/* Presupuestos List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tus Presupuestos</Text>
              {loading ? (
                <ActivityIndicator color={appTheme.colors.primary} />
              ) : (
                budgets.map(budget => {
                  const percent = Math.min((budget.spent / budget.budget) * 100, 100);
                  let color = appTheme.colors.success;
                  if (percent > 80) color = appTheme.colors.warning;
                  if (percent >= 100) color = appTheme.colors.error;

                  return (
                    <View key={budget.id} style={styles.budgetCard}>
                      <View style={styles.budgetHeader}>
                        <View style={styles.budgetIconContainer}>
                          {/* We can use a mapping for icons or keep using what's in mockBudgets if compatible */}
                          <Feather name="pie-chart" size={24} color={color} />
                        </View>
                        <View style={styles.budgetInfo}>
                          <Text style={styles.budgetName}>{budget.name}</Text>
                          <Text style={styles.budgetAmount}>
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                          </Text>
                        </View>
                        <View style={[styles.percentBadge, { backgroundColor: `${color}20` }]}>
                          <Text style={[styles.percentText, { color: color }]}>
                            {percent.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${percent}%`, backgroundColor: color }
                          ]}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Recent Expenses List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Últimos Gastos</Text>
              {transactions.length === 0 ? (
                <Text style={styles.emptyText}>No hay gastos registrados</Text>
              ) : (
                transactions.slice(0, 5).map(tx => (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Feather name="arrow-down-circle" size={24} color={appTheme.colors.error} />
                    </View>
                    <View style={styles.transactionContent}>
                      <Text style={styles.transactionTitle}>{tx.description}</Text>
                      <Text style={styles.transactionCategory}>{tx.category}</Text>
                    </View>
                    <Text style={styles.transactionAmount}>-{formatCurrency(tx.amount)}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {activeTab === 'goals' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tus Metas de Ahorro</Text>

            {/* Mock Goals */}
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalIconContainer}>
                  <Feather name="umbrella" size={24} color={appTheme.colors.info} />
                </View>
                <View style={styles.goalHeaderContent}>
                  <Text style={styles.goalName}>Fondo de Emergencia</Text>
                  <Text style={styles.goalAmount}>€4,500 / €10,000</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '45%' }]} />
              </View>
              <Text style={styles.goalProgress}>45% completado</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalIconContainer}>
                  <Feather name="sun" size={24} color={appTheme.colors.warning} />
                </View>
                <View style={styles.goalHeaderContent}>
                  <Text style={styles.goalName}>Vacaciones 2026</Text>
                  <Text style={styles.goalAmount}>€2,100 / €5,000</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '42%' }]} />
              </View>
              <Text style={styles.goalProgress}>42% completado</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.fabContent}>
          <Feather name="plus" size={28} color="#FFF" />
        </View>
      </TouchableOpacity>

      <CreateTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
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
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: appTheme.colors.backgroundCard,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: appTheme.colors.primary,
  },
  tabText: {
    fontSize: 14,
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
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: appTheme.colors.text,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 12,
  },
  budgetCard: {
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalCard: {
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalHeaderContent: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  goalProgress: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    ...appTheme.shadows.md,
  },
  fabContent: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.text,
  },
  transactionCategory: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.error,
  },
});
