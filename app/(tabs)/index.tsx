import AccountCard from '@/components/AccountCard';
import BudgetProgress from '@/components/BudgetProgress';
import LogoutButton from '@/components/LogoutButton';
import TransactionItem from '@/components/TransactionItem';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { mockBudgets } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Account {
  id: number;
  name: string;
  bank: string;
  lastDigits: string;
  balance: number;
  colors: string[];
  currency: string;
}

interface Transaction {
  id: number;
  category: string;
  name: string;
  description: string;
  amount: number;
  date: string;
  type: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [weeklyChange, setWeeklyChange] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch accounts
      const accountsData = await api.get('/api/v1/accounts');
      const formattedAccounts = accountsData.map((acc: any) => {
        // Determine currency from type field or fallback to name
        let currency = 'EUR';
        const type = (acc.type || '').toUpperCase();
        const accountInfo = `${acc.name} ${acc.address || ''}`.toUpperCase();

        if (['USD', 'EUR', 'CUP', 'CRYPTO', 'USDT', 'BTC', 'ETH'].includes(type)) {
          currency = type;
        } else {
          // Fallback to name detection if type is not a currency (e.g. 'AHORROS')
          if (accountInfo.includes('USD') || accountInfo.includes('DOLLAR')) {
            currency = 'USD';
          } else if (accountInfo.includes('CUP') || accountInfo.includes('PESO')) {
            currency = 'CUP';
          } else if (accountInfo.includes('CRYPTO') || accountInfo.includes('BTC') || accountInfo.includes('ETH')) {
            currency = 'CRYPTO';
          }
        }

        // Color mapping based on currency
        const currencyColors: Record<string, [string, string]> = {
          'USD': ['#10B981', '#059669'],      // Green
          'EUR': ['#94A3B8', '#64748B'],      // Silver/Gray
          'CUP': ['#F97316', '#EA580C'],      // Copper/Orange
          'CRYPTO': ['#F59E0B', '#D97706'],   // Gold
          'DEFAULT': ['#94A3B8', '#64748B'],  // Default Silver
        };

        return {
          id: acc.id,
          name: acc.name || 'Cuenta',
          bank: acc.address || 'Banco',
          lastDigits: String(acc.id).padStart(4, '0').slice(-4),
          balance: parseFloat(acc.balance) || 0,
          colors: currencyColors[currency] || currencyColors['DEFAULT'],
          currency,
        };
      });
      setAccounts(formattedAccounts);

      // Fetch transactions
      const transactionsData = await api.get('/api/v1/transaction');
      const formattedTransactions = transactionsData
        .filter((tx: any) => tx && tx.id) // Filter out invalid transactions
        .map((tx: any) => {
          const isDeposit = tx.transactionType === 'deposit';
          const amount = parseFloat(tx.amount) || 0;

          return {
            id: tx.id,
            category: tx.category || 'general',
            name: tx.description || 'Transacción',
            description: tx.notes || '',
            amount: isDeposit ? Math.abs(amount) : -Math.abs(amount),
            date: tx.date || new Date().toISOString(),
            type: isDeposit ? 'income' : 'expense',
          };
        });
      setTransactions(formattedTransactions);

      // Calculate weekly change
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyTransactions = formattedTransactions.filter((tx: Transaction) => {
        const txDate = new Date(tx.date);
        return txDate >= oneWeekAgo;
      });

      const weeklyTotal = weeklyTransactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      setWeeklyChange(weeklyTotal);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  // Calculate total balance from real accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Weekly summary from real transactions - filter out invalid transactions first
  const validTransactions = transactions.filter(t => t && t.date && t.type);

  const weeklyIncome = validTransactions
    .filter(t => {
      const txDate = new Date(t.date);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return t.type === 'income' && txDate >= oneWeekAgo;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const weeklyExpenses = validTransactions
    .filter(t => {
      const txDate = new Date(t.date);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return t.type === 'expense' && txDate >= oneWeekAgo;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const weeklyProgress = weeklyIncome > 0 ? (weeklyExpenses / weeklyIncome) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Feather name="user" size={24} color={appTheme.colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userEmail}>{user?.email || 'usuario@email.com'}</Text>
              <Text style={styles.subtitle}>Panel de Control Familiar</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.iconButton}
              disabled={loading}
            >
              <Feather
                name="refresh-cw"
                size={22}
                color={loading ? appTheme.colors.textSecondary : appTheme.colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={22} color={appTheme.colors.text} />
            </TouchableOpacity>
            <LogoutButton />
          </View>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#0EA5A4', '#0D8F8E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Saldo Total Consolidado</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
          <View style={styles.balanceBadge}>
            <Feather
              name={weeklyChange >= 0 ? "trending-up" : "trending-down"}
              size={14}
              color={weeklyChange >= 0 ? "#10B981" : "#EF4444"}
            />
            <Text style={styles.balanceBadgeText}>
              {weeklyChange >= 0 ? '+' : ''}{formatCurrency(weeklyChange)} esta semana
            </Text>
          </View>
        </LinearGradient>

        {/* Mis Cuentas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Cuentas</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/accounts')}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {accounts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.accountsScroll}
            >
              {accounts.map(account => (
                <AccountCard
                  key={account.id}
                  name={account.name}
                  bank={account.bank}
                  lastDigits={account.lastDigits}
                  balance={account.balance}
                  colors={account.colors}
                  currency={account.currency}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay cuentas disponibles</Text>
            </View>
          )}
        </View>

        {/* Resumen Semanal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Semanal</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Gastos</Text>
                <Text style={[styles.summaryAmount, styles.expenseAmount]}>
                  {formatCurrency(weeklyExpenses)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ingresos</Text>
                <Text style={[styles.summaryAmount, styles.incomeAmount]}>
                  {formatCurrency(weeklyIncome)}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(weeklyProgress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{weeklyProgress.toFixed(0)}% del ingreso gastado</Text>
            </View>
          </View>
        </View>

        {/* Actividad Reciente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {validTransactions.length > 0 ? (
            <View>
              {validTransactions.slice(0, 3).map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  category={transaction.category}
                  name={transaction.name}
                  description={transaction.description}
                  amount={transaction.amount}
                  date={new Date(transaction.date)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay transacciones recientes</Text>
            </View>
          )}
        </View>

        {/* Presupuestos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Presupuestos</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/budgets')}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          <View>
            {mockBudgets.slice(0, 3).map(budget => (
              <BudgetProgress
                key={budget.id}
                category={budget.category}
                name={budget.name}
                spent={budget.spent}
                budget={budget.budget}
                icon={budget.icon}
              />
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {/* TODO: Open transaction modal */ }}
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: appTheme.colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  balanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: appTheme.colors.primary,
    fontWeight: '600',
  },
  accountsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  expenseAmount: {
    color: appTheme.colors.error,
  },
  incomeAmount: {
    color: appTheme.colors.success,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: appTheme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    ...appTheme.shadows.md,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});