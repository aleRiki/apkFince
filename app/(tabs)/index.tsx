import AccountCard from '@/components/AccountCard';
import BudgetProgress from '@/components/BudgetProgress';
import TransactionItem from '@/components/TransactionItem';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { mockBudgets } from '@/constants/mockData';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useCards } from '@/hooks/useCards';
import { useTasasCambio } from '@/hooks/useTasasCambio';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
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

function FadeInView({ children, delay = 0, style }: { children: any; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}



export default function HomeScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyChange, setWeeklyChange] = useState(0);
  const { cards, refetch: refetchCards } = useCards();
  const { rates, refetch: refetchRates } = useTasasCambio();

  const rateMap = useMemo(() => {
    const map: Record<string, number> = { USD: 1 };
    rates.forEach(r => { map[r.currency] = r.rate; });
    return map;
  }, [rates]);

  const totalCardBalanceUSD = useMemo(() => {
    let total = 0;
    cards.forEach(card => {
      const account = accounts.find(a => String(a.id) === String(card.account?.id));
      if (account) {
        const rate = rateMap[account.currency || 'USD'] || 1;
        total += account.balance * rate;
      }
    });
    return total;
  }, [cards, accounts, rateMap]);

  const fetchData = useCallback(async () => {
    try {
      const accountsData = await api.get('/api/v1/accounts');
      const formattedAccounts = accountsData.map((acc: any) => {
        let currency = 'USD';
        const type = (acc.type || '').toUpperCase();
        const accountInfo = `${acc.name} ${acc.address || ''}`.toUpperCase();

        if (['USD', 'EUR', 'CUP', 'CRYPTO', 'USDT', 'BTC', 'ETH'].includes(type)) {
          currency = type;
        } else {
          if (accountInfo.includes('USD') || accountInfo.includes('DOLLAR')) {
            currency = 'USD';
          } else if (accountInfo.includes('CUP') || accountInfo.includes('PESO')) {
            currency = 'CUP';
          } else if (accountInfo.includes('CRYPTO') || accountInfo.includes('BTC') || accountInfo.includes('ETH')) {
            currency = 'CRYPTO';
          }
        }

        const currencyColors: Record<string, [string, string]> = {
          'USD': ['#10B981', '#059669'],
          'EUR': ['#94A3B8', '#64748B'],
          'CUP': ['#F97316', '#EA580C'],
          'CRYPTO': ['#F59E0B', '#D97706'],
          'DEFAULT': ['#94A3B8', '#64748B'],
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

      const transactionsData = await api.get('/api/v1/transaction');
      const formattedTransactions = transactionsData
        .filter((tx: any) => tx && tx.id)
        .map((tx: any) => {
          const isDeposit = tx.transactionType === 'deposit';
          const amount = parseFloat(tx.amount) || 0;
          const cardInfo = tx.card?.number ? ` (${tx.card.number})` : '';
          const accountInfo = tx.card?.account?.name ? ` · ${tx.card.account.name}` : '';
          return {
            id: tx.id,
            category: tx.category || 'general',
            name: tx.description || 'Transacción',
            description: (tx.notes || '') + cardInfo + accountInfo,
            amount: isDeposit ? Math.abs(amount) : -Math.abs(amount),
            date: tx.createAt || tx.createdAt || new Date().toISOString(),
            type: isDeposit ? 'income' : 'expense',
          };
        });
      setTransactions(formattedTransactions);

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
    }
  }, []);

  useAutoRefresh(fetchData, 30000);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), refetchCards(), refetchRates()]);
    setRefreshing(false);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const validTransactions = transactions.filter(t => t && t.date && t.type);

  const totalIncome = validTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = validTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalProgress = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={appTheme.colors.primary} />}
      >
        <FadeInView>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshFab} disabled={loading}>
            <Feather name="refresh-cw" size={20} color={loading ? appTheme.colors.textSecondary : appTheme.colors.primary} />
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={100}>
            <LinearGradient
            colors={['#0EA5A4', '#0D8F8E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Saldo en Tarjetas (USD)</Text>
            <Text style={styles.balanceAmount}>
              ${totalCardBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {rates.length > 0 && (
              <View style={styles.rateRow}>
                {rates.map(r => (
                  <Text key={r.currency} style={styles.rateBadge}>
                    1 {r.currency} = ${Number(r.rate).toFixed(4)}
                  </Text>
                ))}
              </View>
            )}
            <View style={styles.balanceBadge}>
              <Feather name={weeklyChange >= 0 ? 'trending-up' : 'trending-down'} size={14} color={weeklyChange >= 0 ? '#10B981' : '#EF4444'} />
              <Text style={styles.balanceBadgeText}>
                {weeklyChange >= 0 ? '+' : ''}{formatCurrency(weeklyChange)} esta semana
              </Text>
            </View>
          </LinearGradient>
        </FadeInView>

        <FadeInView delay={150}>
          <View style={styles.groupedBalanceRow}>
            {(() => {
              const grouped: Record<string, { balance: number; color: string; symbol: string }> = {};
              accounts.forEach(acc => {
                const curr = acc.currency || 'EUR';
                if (!grouped[curr]) {
                  const colors: Record<string, { color: string; symbol: string }> = {
                    USD: { color: '#10B981', symbol: '$' },
                    EUR: { color: '#6366F1', symbol: '€' },
                    CUP: { color: '#F97316', symbol: '₱' },
                    CRYPTO: { color: '#F59E0B', symbol: '₿' },
                  };
                  grouped[curr] = { balance: 0, ...(colors[curr] || { color: '#94A3B8', symbol: curr }) };
                }
                grouped[curr].balance += acc.balance;
              });
              return Object.entries(grouped).map(([currency, data]) => (
                <View key={currency} style={styles.groupedBalanceItem}>
                  <Text style={[styles.groupedBalanceValue, { color: data.color }]}>
                    {data.symbol}{data.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.groupedBalanceLabel}>{currency}</Text>
                </View>
              ));
            })()}
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Cuentas</Text>
            </View>
            {accounts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountsScroll}>
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
        </FadeInView>

        <FadeInView delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Balance de Transaciones</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Gastos</Text>
                  <Text style={[styles.summaryAmount, styles.expenseAmount]}>{formatCurrency(totalExpenses)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ingresos</Text>
                  <Text style={[styles.summaryAmount, styles.incomeAmount]}>{formatCurrency(totalIncome)}</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(totalProgress, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{totalProgress.toFixed(0)}% del ingreso gastado</Text>
              </View>
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            </View>
            {validTransactions.length > 0 ? (
              <View>
                {validTransactions.slice(0, 10).map(transaction => (
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
        </FadeInView>

        <View style={{ height: 100 }} />
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: appTheme.colors.background },
  container: { flex: 1 },
  refreshFab: { alignSelf: 'flex-end', marginRight: 20, marginTop: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: appTheme.colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  balanceCard: { marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 24 },
  balanceLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: '#FFF', marginBottom: 12 },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  balanceBadgeText: { fontSize: 12, fontWeight: '600', color: '#FFF', marginLeft: 4 },
  rateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  rateBadge: { fontSize: 10, color: '#FFF', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: appTheme.colors.text },
  seeAll: { fontSize: 14, color: appTheme.colors.primary, fontWeight: '600' },
  accountsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  summaryCard: { backgroundColor: appTheme.colors.backgroundCard, borderRadius: 16, padding: 20 },
  summaryRow: { flexDirection: 'row', marginBottom: 20 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(148, 163, 184, 0.2)', marginHorizontal: 16 },
  summaryLabel: { fontSize: 12, color: appTheme.colors.textSecondary, marginBottom: 8 },
  summaryAmount: { fontSize: 24, fontWeight: '700' },
  expenseAmount: { color: appTheme.colors.error },
  incomeAmount: { color: appTheme.colors.success },
  progressContainer: { gap: 8 },
  progressBar: { height: 8, backgroundColor: 'rgba(148, 163, 184, 0.2)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: appTheme.colors.primary, borderRadius: 4 },
  progressText: { fontSize: 12, color: appTheme.colors.textSecondary, textAlign: 'center' },
  groupedBalanceRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 8 },
  groupedBalanceItem: { flex: 1, backgroundColor: appTheme.colors.backgroundCard, borderRadius: 12, padding: 12, alignItems: 'center' },
  groupedBalanceValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  groupedBalanceLabel: { fontSize: 11, color: appTheme.colors.textSecondary, fontWeight: '600' },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyStateText: { fontSize: 14, color: appTheme.colors.textSecondary },
  fab: { position: 'absolute', bottom: 24, right: 24, borderRadius: 28, ...appTheme.shadows.md },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
