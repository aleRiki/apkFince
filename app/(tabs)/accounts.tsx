import AccountCard from '@/components/AccountCard';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { mockAccounts, mockCreditCards } from '@/constants/mockData';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AccountsScreen() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards'>('accounts');

  const totalBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0) +
                      mockCreditCards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Cuentas y Tarjetas</Text>
      </View>

      {/* Balance Total */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accounts' && styles.activeTab]}
          onPress={() => setActiveTab('accounts')}
        >
          <Text style={[styles.tabText, activeTab === 'accounts' && styles.activeTabText]}>
            Cuentas y Tarjetas
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
            {mockAccounts.map(account => (
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

            <Text style={styles.sectionTitle}>Otros Activos</Text>
            <View style={styles.listItem}>
              <View style={styles.listItemIcon}>
                <MaterialCommunityIcons name="cash" size={24} color={appTheme.colors.success} />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Efectivo</Text>
                <Text style={styles.listItemSubtitle}>Dinero en mano</Text>
              </View>
              <Text style={styles.listItemAmount}>{formatCurrency(1200.00)}</Text>
            </View>

            <View style={styles.listItem}>
              <View style={styles.listItemIcon}>
                <MaterialCommunityIcons name="chart-line" size={24} color={appTheme.colors.info} />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Inversiones</Text>
                <Text style={styles.listItemSubtitle}>Fondo de DGM</Text>
              </View>
              <Text style={styles.listItemAmount}>{formatCurrency(13650.00)}</Text>
            </View>
          </View>
        )}

        {activeTab === 'cards' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tarjetas de Crédito</Text>
            {mockCreditCards.map(card => (
              <View key={card.id} style={styles.cardContainer}>
                <AccountCard
                  name={card.name}
                  bank={card.bank}
                  lastDigits={card.lastDigits}
                  balance={card.balance}
                  colors={card.color}
                />
                <View style={styles.cardDetails}>
                  <View style={styles.cardDetail}>
                    <Text style={styles.cardDetailLabel}>Disponible</Text>
                    <Text style={styles.cardDetailValue}>{formatCurrency(card.balance)}</Text>
                  </View>
                  <View style={styles.cardDetail}>
                    <Text style={styles.cardDetailLabel}>Límite</Text>
                    <Text style={styles.cardDetailValue}>{formatCurrency(card.limit)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <View style={styles.fabContent}>
          <Feather name="plus" size={28} color="#FFF" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  header: {
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
  cardContainer: {
    marginBottom: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cardDetail: {
    flex: 1,
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
  },
  cardDetailLabel: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    marginBottom: 4,
  },
  cardDetailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
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
