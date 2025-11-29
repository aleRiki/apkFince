import BudgetProgress from '@/components/BudgetProgress';
import LogoutButton from '@/components/LogoutButton';
import { appTheme } from '@/constants/appTheme';
import { mockBudgets } from '@/constants/mockData';
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

export default function BudgetsScreen() {
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets');

  const totalBudget = mockBudgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = mockBudgets.reduce((sum, b) => sum + b.spent, 0);

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
              <Text style={styles.summaryAmount}>€{totalSpent.toFixed(0)} / €{totalBudget.toFixed(0)}</Text>
              <Text style={styles.summarySubtext}>
                {((totalSpent / totalBudget) * 100).toFixed(0)}% del presupuesto para esta mes
              </Text>
            </View>

            {/* Presupuestos List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tus Presupuestos</Text>
              {mockBudgets.map(budget => (
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 12,
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
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: appTheme.colors.success,
    borderRadius: 4,
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
});
