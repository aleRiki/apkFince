import AddAccountModal from '@/components/AddAccountModal';
import AddCardModal from '@/components/AddCardModal';
import DepositModal from '@/components/DepositModal';
import LogoutButton from '@/components/LogoutButton';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { useAccounts } from '@/hooks/useAccounts';
import { useCards } from '@/hooks/useCards';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
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

const CURRENCY_CARD_STYLES: Record<string, [string, string]> = {
  USD: ['#10B981', '#059669'],
  EUR: ['#6366F1', '#4F46E5'],
  CUP: ['#F97316', '#EA580C'],
  CRYPTO: ['#F59E0B', '#D97706'],
  DEFAULT: ['#3B82F6', '#1D4ED8'],
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', CUP: '₱', CRYPTO: '₿',
};

function CreditCardChip() {
  return (
    <View style={styles.chip}>
      <View style={styles.chipInner} />
    </View>
  );
}

function VisualCard({ card, accountsMap, onDelete, onPress, index }: {
  card: any; accountsMap: any; onDelete: (id: string) => void; onPress: (card: any) => void; index: number;
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

  const colors: [string, string] = CURRENCY_CARD_STYLES[currency] || CURRENCY_CARD_STYLES.DEFAULT;
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  const rawBalance = card.balance || account.balance || 0;
  const balance = parseFloat(rawBalance) || 0;
  const last4 = card.number ? card.number.slice(-4) : '0000';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 16 }}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(card)}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.visualCard}>
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.cardPattern} />
          </View>

          <View style={styles.cardTop}>
            <Text style={styles.cardAccountName} numberOfLines={1}>{account.name || 'Cuenta'}</Text>
            <TouchableOpacity onPress={() => onDelete(card.id)} style={styles.cardDeleteBtn}>
              <Feather name="trash-2" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardCenter}>
            <CreditCardChip />
            <Text style={styles.cardBalanceLabel}>Balance Total</Text>
            <Text style={styles.cardBalance}>
              {symbol}{balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardType}>{accType} Account</Text>
              {account.bank && <Text style={styles.cardBank}>{account.bank}</Text>}
            </View>
            <Text style={styles.cardLast4}>••• {last4}</Text>
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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const accountsMap = accounts.reduce((map, acc) => ({ ...map, [acc.id]: acc }), {} as any);

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
    await Promise.all([refetchAccounts(), refetchCards()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>Estado Bancario</Text>
        <LogoutButton />
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Saldo Total Disponible</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
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
              accounts.map(account => (
                <TouchableOpacity key={account.id} style={styles.listItem} activeOpacity={0.7}>
                  <View style={[styles.listItemIcon, { backgroundColor: account.color ? `${account.color[0]}20` : 'rgba(14,165,164,0.1)' }]}>
                    <Feather name="credit-card" size={24} color={account.color?.[0] || appTheme.colors.primary} />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{account.name}</Text>
                    <Text style={styles.listItemSubtitle}>{account.bank} •••• {account.lastDigits}</Text>
                  </View>
                  <Text style={styles.listItemAmount}>{formatCurrency(account.balance, account.currency)}</Text>
                </TouchableOpacity>
              ))
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
                  accountsMap={accountsMap}
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
  balanceLabel: { fontSize: 14, color: appTheme.colors.textSecondary, marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: appTheme.colors.text },
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
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: appTheme.colors.backgroundCard, borderRadius: 12, padding: 16, marginBottom: 8 },
  listItemIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: '600', color: appTheme.colors.text, marginBottom: 2 },
  listItemSubtitle: { fontSize: 13, color: appTheme.colors.textSecondary },
  listItemAmount: { fontSize: 18, fontWeight: '700', color: appTheme.colors.text },
  visualCard: { borderRadius: 16, padding: 20, overflow: 'hidden', minHeight: 200, justifyContent: 'space-between' },
  cardPattern: { position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardAccountName: { fontSize: 14, fontWeight: '700', color: '#FFF', letterSpacing: 1, textTransform: 'uppercase', flex: 1, marginRight: 8 },
  cardDeleteBtn: { padding: 4, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)' },
  cardCenter: { alignItems: 'center', paddingVertical: 8 },
  chip: { width: 40, height: 28, borderRadius: 4, backgroundColor: '#FFC72C', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  chipInner: { width: 24, height: 14, borderRadius: 2, backgroundColor: '#FBBF24', borderWidth: 0.5, borderColor: '#D97706' },
  cardBalanceLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  cardBalance: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardType: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  cardBank: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  cardLast4: { fontSize: 16, fontWeight: '600', color: '#FFF', letterSpacing: 2 },
  fabContainer: { position: 'absolute', bottom: 24, right: 20, alignItems: 'flex-end', gap: 12 },
  fabPrimary: { width: 56, height: 56, borderRadius: 28, backgroundColor: appTheme.colors.accent, alignItems: 'center', justifyContent: 'center', ...appTheme.shadows.md },
  fabSecondary: { flexDirection: 'row', alignItems: 'center', backgroundColor: appTheme.colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, gap: 8, ...appTheme.shadows.md },
  fabLabel: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});
