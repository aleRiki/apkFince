import AddAccountModal from '@/components/AddAccountModal';
import AddCardModal from '@/components/AddCardModal';
import DepositModal from '@/components/DepositModal';
import LogoutButton from '@/components/LogoutButton';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { useAccounts } from '@/hooks/useAccounts';
import { useCards } from '@/hooks/useCards';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
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

export default function AccountsScreen() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards'>('accounts');
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const { accounts, loading, refetch: refetchAccounts } = useAccounts();
  const { cards, loading: cardsLoading, addCard, refetch: refetchCards } = useCards();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleAddCard = async (cardNumber: string, accountId: number) => {
    await addCard({ number: cardNumber, account: accountId });
  };

  const handleAddAccount = async (accountData: any) => {
    try {
      await api.post('/api/v1/accounts', accountData);
      alert('Cuenta creada exitosamente');
      await refetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
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
      // Refresh data
      await Promise.all([refetchCards(), refetchAccounts()]);
    } catch (error) {
      console.error('Error registering deposit:', error);
      alert('Error al registrar el ingreso');
    }
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
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accounts' && styles.activeTab]}
          onPress={() => setActiveTab('accounts')}
        >
          <Text style={[styles.tabText, activeTab === 'accounts' && styles.activeTabText]}>
            Cuentas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
          onPress={() => setActiveTab('cards')}
        >
          <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>
            Tarjetas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'accounts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuentas Bancarias</Text>
            {accounts.map(account => (
              <View key={account.id} style={styles.listItem}>
                <View style={styles.listItemIcon}>
                  <Feather name="credit-card" size={24} color={appTheme.colors.primary} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{account.name}</Text>
                  <Text style={styles.listItemSubtitle}>{account.bank} •••• {account.lastDigits}</Text>
                </View>
                <Text style={styles.listItemAmount}>{formatCurrency(account.balance)}</Text>
              </View>
            ))}

            <View style={styles.divider} />
          </View>
        )}

        {activeTab === 'cards' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tarjetas</Text>
            {cardsLoading ? (
              <Text style={styles.emptyText}>Cargando tarjetas...</Text>
            ) : cards.length === 0 ? (
              <Text style={styles.emptyText}>No tienes tarjetas asociadas</Text>
            ) : (
              cards.map(card => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.listItem}
                  onPress={() => handleCardPress(card)}
                >
                  <View style={styles.listItemIcon}>
                    <Feather name="credit-card" size={24} color={appTheme.colors.accent} />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Tarjeta •••• {card.number.slice(-4)}</Text>
                    <Text style={styles.listItemSubtitle}>{card.account.name}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={appTheme.colors.textSecondary} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          if (activeTab === 'accounts') {
            setAccountModalVisible(true);
          } else {
            setCardModalVisible(true);
          }
        }}
      >
        <View style={styles.fabContent}>
          <Feather name="plus" size={28} color="#FFF" />
        </View>
      </TouchableOpacity>

      <AddAccountModal
        visible={accountModalVisible}
        onClose={() => setAccountModalVisible(false)}
        onSubmit={handleAddAccount}
      />

      <AddCardModal
        visible={cardModalVisible}
        onClose={() => setCardModalVisible(false)}
        onSubmit={handleAddCard}
      />

      <DepositModal
        visible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
        onSubmit={handleDeposit}
        cardId={selectedCard?.id || 0}
        cardName={selectedCard ? `Tarjeta •••• ${selectedCard.number.slice(-4)}` : ''}
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
  balanceSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: appTheme.colors.backgroundCard,
    marginHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: appTheme.colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  listItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 164, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.text,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: appTheme.colors.textSecondary,
  },
  listItemAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: 20,
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
});
