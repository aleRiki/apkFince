import AddAccountModal from '@/components/AddAccountModal';
import AddCardModal from '@/components/AddCardModal';
import DepositModal from '@/components/DepositModal';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { useAccounts } from '@/hooks/useAccounts';
import { useCards } from '@/hooks/useCards';
import { useTasasCambio } from '@/hooks/useTasasCambio';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const CURRENCY_STYLE: Record<string, { colors: [string, string]; symbol: string; label: string }> = {
  USD: { colors: ['#10B981', '#059669'], symbol: '$', label: 'USD' },
  EUR: { colors: ['#6366F1', '#4F46E5'], symbol: '€', label: 'EUR' },
  CUP: { colors: ['#F97316', '#EA580C'], symbol: '₱', label: 'CUP' },
  CRYPTO: { colors: ['#F59E0B', '#D97706'], symbol: '₿', label: 'CRYPTO' },
  DEFAULT: { colors: ['#3B82F6', '#1D4ED8'], symbol: '$', label: 'USD' },
};

function CardChip() {
  return (
    <View style={styles.chip}>
      <View style={styles.chipInner} />
    </View>
  );
}

function NetworkLogo() {
  return (
    <View style={styles.networkRow}>
      <View style={[styles.networkCircle, { backgroundColor: '#FF0000', marginRight: -6 }]} />
      <View style={[styles.networkCircle, { backgroundColor: '#F9A000' }]} />
    </View>
  );
}

function VisualCard({ card, onDelete, onPress, index }: {
  card: any; onDelete: (id: string) => void; onPress: (card: any) => void; index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const account = card.account || {};
  const accType = (account.type || account.name || '').toUpperCase();
  let currency = 'DEFAULT';
  if (accType.includes('USD')) currency = 'USD';
  else if (accType.includes('EUR')) currency = 'EUR';
  else if (accType.includes('CUP')) currency = 'CUP';
  else if (accType.includes('CRYPTO') || accType.includes('BTC')) currency = 'CRYPTO';
  else if (account.currency) currency = account.currency;

  const style = CURRENCY_STYLE[currency] || CURRENCY_STYLE.DEFAULT;
  const rawBalance = card.balance || account.balance || 0;
  const balance = parseFloat(rawBalance) || 0;
  const last4 = card.number ? card.number.slice(-4) : '0000';
  const holderName = (account.name || 'TITULAR').toUpperCase();

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 16 }}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(card)}>
        <LinearGradient colors={style.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.visualCard}>
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.vcBgCircle1} />
            <View style={styles.vcBgCircle2} />
          </View>

          <View style={styles.vcTop}>
            <CardChip />
            <TouchableOpacity onPress={() => onDelete(card.id)} style={styles.vcDeleteBtn}>
              <Feather name="trash-2" size={14} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          <View style={styles.vcNumberRow}>
            <Text style={styles.vcNumberGroup}>••••</Text>
            <Text style={styles.vcNumberGroup}>••••</Text>
            <Text style={styles.vcNumberGroup}>••••</Text>
            <Text style={styles.vcNumberGroup}>{last4}</Text>
          </View>

          <View style={styles.vcMidRow}>
            <View style={styles.vcHolder}>
              <Text style={styles.vcLabel}>TITULAR</Text>
              <Text style={styles.vcValue} numberOfLines={1}>{holderName}</Text>
            </View>
            <View>
              <Text style={styles.vcLabel}>VENCE</Text>
              <Text style={styles.vcValue}>12/28</Text>
            </View>
          </View>

          <View style={styles.vcBottomBar}>
            <View>
              <Text style={styles.vcBalLabel}>Saldo Disponible</Text>
              <Text style={styles.vcBalValue}>
                {style.symbol}{balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <NetworkLogo />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AccountsScreen() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards'>('accounts');
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { accounts, loading, refetch: refetchAccounts } = useAccounts();
  const { cards, loading: cardsLoading, addCard, refetch: refetchCards } = useCards();
  const { rates, refetch: refetchRates } = useTasasCambio();

  const rateMap = useMemo(() => {
    const map: Record<string, number> = { USD: 1 };
    rates.forEach(r => { map[r.currency] = r.rate; });
    return map;
  }, [rates]);

  const totalBalanceUSD = useMemo(() => {
    return accounts.reduce((sum, acc) => {
      const curr = acc.currency || 'USD';
      const rate = rateMap[curr] || 1;
      return sum + acc.balance * rate;
    }, 0);
  }, [accounts, rateMap]);

  const handleAddCard = async (cardNumber: string, accountId: number) => {
    await addCard({ number: cardNumber, account: accountId });
  };

  const handleAddAccount = async (accountData: any) => {
    try {
      await api.post('/api/v1/accounts', accountData);
      alert('Cuenta creada exitosamente');
      await refetchAccounts();
    } catch (error) {
      alert('Error al crear la cuenta');
    }
  };

  const handleCardPress = (card: any) => {
    setSelectedCard(card);
    setDepositModalVisible(true);
  };

  const handleDeposit = async (depositData: any) => {
    try {
      await api.post('/api/v1/transaction', depositData);
      alert('Ingreso registrado exitosamente');
      await Promise.all([refetchCards(), refetchAccounts()]);
    } catch (error) {
      alert('Error al registrar el ingreso');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await api.delete(`/api/v1/card/${cardId}`);
      await refetchCards();
    } catch (error) {
      alert('Error al eliminar la tarjeta');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAccounts(), refetchCards(), refetchRates()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>Estado Bancario</Text>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Saldo Consolidado (USD)</Text>
        <Text style={styles.balanceAmount}>
          ${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        {rates.length > 0 && (
          <View style={styles.rateRow}>
            {rates.map(r => (
              <Text key={r.currency} style={styles.rateBadge}>
                1 {r.currency} = ${r.rate.toFixed(4)}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.tabs}>
        {['accounts', 'cards'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'accounts' ? 'Cuentas' : 'Tarjetas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={appTheme.colors.primary} />}
      >
        {activeTab === 'accounts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuentas Bancarias</Text>
            {accounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="credit-card" size={48} color={appTheme.colors.textSecondary} />
                <Text style={styles.emptyText}>No hay cuentas registradas</Text>
              </View>
            ) : (
              accounts.map(account => {
                const curr = account.currency || 'USD';
                const cs = CURRENCY_STYLE[curr] || CURRENCY_STYLE.DEFAULT;
                return (
                  <View key={account.id} style={styles.bankAccountCard}>
                    <LinearGradient
                      colors={cs.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.bankAccBadge}
                    >
                      <Text style={styles.bankAccCurrency}>{cs.symbol}</Text>
                    </LinearGradient>
                    <View style={styles.bankAccInfo}>
                      <Text style={styles.bankAccName}>{account.name}</Text>
                      <Text style={styles.bankAccBank}>{account.bank}</Text>
                      <View style={styles.bankAccMeta}>
                        <View style={styles.bankAccTypeBadge}>
                          <Text style={styles.bankAccTypeText}>{cs.label}</Text>
                        </View>
                        <Text style={styles.bankAccDigits}>•••• {account.lastDigits}</Text>
                      </View>
                    </View>
                    <View style={styles.bankAccBal}>
                      <Text style={styles.bankAccBalLabel}>Saldo</Text>
                      <Text style={styles.bankAccBalValue}>
                        {formatCurrency(account.balance, curr)}
                      </Text>
                      {curr !== 'USD' && rateMap[curr] && (
                        <Text style={styles.bankAccBalUsd}>
                          ≈ ${(account.balance * rateMap[curr]).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'cards' && (
          <View style={styles.section}>
            {cardsLoading ? (
              <Text style={styles.loadingText}>Cargando tarjetas...</Text>
            ) : cards.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="credit-card" size={48} color={appTheme.colors.textSecondary} />
                <Text style={styles.emptyText}>No tienes tarjetas asociadas</Text>
              </View>
            ) : (
              cards.map((card, idx) => (
                <VisualCard
                  key={card.id}
                  card={card}
                  onDelete={handleDeleteCard}
                  onPress={handleCardPress}
                  index={idx}
                />
              ))
            )}
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      <View style={styles.fabContainer}>
        {activeTab === 'cards' && (
          <TouchableOpacity style={styles.fabSecondary} activeOpacity={0.8} onPress={() => setCardModalVisible(true)}>
            <Feather name="credit-card" size={20} color="#FFF" />
            <Text style={styles.fabLabel}>Nueva Tarjeta</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.fabPrimary}
          activeOpacity={0.8}
          onPress={() => {
            if (activeTab === 'accounts') setAccountModalVisible(true);
            else setCardModalVisible(true);
          }}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <AddAccountModal visible={accountModalVisible} onClose={() => setAccountModalVisible(false)} onSubmit={handleAddAccount} />
      <AddCardModal visible={cardModalVisible} onClose={() => setCardModalVisible(false)} onSubmit={handleAddCard} />
      <DepositModal
        visible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
        onSubmit={handleDeposit}
        cardId={selectedCard?.id || 0}
        cardName={selectedCard ? `Tarjeta •••• ${selectedCard.number?.slice(-4)}` : ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: appTheme.colors.background },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', color: appTheme.colors.text },
  balanceSection: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: appTheme.colors.backgroundCard, marginHorizontal: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  balanceLabel: { fontSize: 13, color: appTheme.colors.textSecondary, marginBottom: 4, fontWeight: '600', letterSpacing: 0.5 },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: appTheme.colors.text },
  rateRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 8 },
  rateBadge: { fontSize: 10, color: appTheme.colors.primary, backgroundColor: 'rgba(14,165,164,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontWeight: '600' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: appTheme.colors.backgroundCard, alignItems: 'center' },
  activeTab: { backgroundColor: appTheme.colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: appTheme.colors.textSecondary },
  activeTabText: { color: '#FFF' },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: appTheme.colors.text, marginBottom: 12, marginTop: 8 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: appTheme.colors.textSecondary, marginTop: 12 },
  loadingText: { textAlign: 'center', color: appTheme.colors.textSecondary, marginTop: 20 },

  bankAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.08)',
  },
  bankAccBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bankAccCurrency: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  bankAccInfo: { flex: 1, marginRight: 10 },
  bankAccName: { fontSize: 15, fontWeight: '700', color: appTheme.colors.text, marginBottom: 2 },
  bankAccBank: { fontSize: 12, color: appTheme.colors.textSecondary, marginBottom: 4 },
  bankAccMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bankAccTypeBadge: { backgroundColor: 'rgba(148,163,184,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  bankAccTypeText: { fontSize: 10, fontWeight: '700', color: appTheme.colors.textSecondary },
  bankAccDigits: { fontSize: 11, color: appTheme.colors.textSecondary, fontWeight: '500' },
  bankAccBal: { alignItems: 'flex-end' },
  bankAccBalLabel: { fontSize: 10, color: appTheme.colors.textSecondary, marginBottom: 2 },
  bankAccBalValue: { fontSize: 16, fontWeight: '800', color: appTheme.colors.text },
  bankAccBalUsd: { fontSize: 11, color: appTheme.colors.primary, fontWeight: '600', marginTop: 1 },

  visualCard: { borderRadius: 16, padding: 20, overflow: 'hidden', minHeight: 210, justifyContent: 'space-between' },
  vcBgCircle1: { position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.06)' },
  vcBgCircle2: { position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' },
  vcTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vcDeleteBtn: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)' },
  vcNumberRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  vcNumberGroup: { color: '#FFF', fontSize: 17, fontWeight: '600', letterSpacing: 3, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  vcMidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  vcHolder: { flex: 1, marginRight: 16 },
  vcLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', letterSpacing: 1, marginBottom: 2 },
  vcValue: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  vcBottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  vcBalLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '500', marginBottom: 2 },
  vcBalValue: { color: '#FFF', fontSize: 20, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  chip: { width: 36, height: 26, borderRadius: 4, backgroundColor: '#FFC72C', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 },
  chipInner: { width: 18, height: 12, borderRadius: 2, backgroundColor: '#D4A823', borderWidth: 0.5, borderColor: '#B8951E' },
  networkRow: { flexDirection: 'row', alignItems: 'center' },
  networkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  fabContainer: { position: 'absolute', bottom: 24, right: 20, alignItems: 'flex-end', gap: 12 },
  fabPrimary: { width: 56, height: 56, borderRadius: 28, backgroundColor: appTheme.colors.accent, alignItems: 'center', justifyContent: 'center', ...appTheme.shadows.md },
  fabSecondary: { flexDirection: 'row', alignItems: 'center', backgroundColor: appTheme.colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, gap: 8, ...appTheme.shadows.md },
  fabLabel: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});
