import LogoutButton from '@/components/LogoutButton';
import { appTheme, formatCurrency } from '@/constants/appTheme';
import { mockCategoryExpenses, mockMonthlyData } from '@/constants/mockData';
import React, { useState } from 'react';
import {
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
const CHART_WIDTH = width - 40;

export default function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState<'month' | 'quarter' | 'year'>('month');

  const totalIncome = 2850;
  const totalExpenses = 1975.50;
  const balance = totalIncome - totalExpenses;

  // Simple donut chart calculation
  const total = mockCategoryExpenses.reduce((sum, cat) => sum + cat.amount, 0);

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

          <View style={styles.donutContainer}>
            <View style={styles.donutChart}>
              {mockCategoryExpenses.map((cat, index) => {
                const percentage = (cat.amount / total) * 100;
                return (
                  <View key={index} style={styles.donutSegment}>
                    <View style={[styles.donutBar, { backgroundColor: cat.color, height: `${percentage}%` }]} />
                  </View>
                );
              })}
            </View>

            <View style={styles.donutCenter}>
              <Text style={styles.donutCenterLabel}>Total</Text>
              <Text style={styles.donutCenterValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <View style={styles.legend}>
            {mockCategoryExpenses.map((cat, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                <Text style={styles.legendLabel}>{cat.category}</Text>
                <Text style={styles.legendValue}>{cat.percentage}%</Text>
                <Text style={styles.legendAmount}>{formatCurrency(cat.amount)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolución Mensual</Text>

          <View style={styles.barChart}>
            <View style={styles.barChartBars}>
              {mockMonthlyData.map((data, index) => {
                const maxValue = Math.max(...mockMonthlyData.map(d => Math.max(d.income, d.expense)));
                const incomeHeight = (data.income / maxValue) * 140;
                const expenseHeight = (data.expense / maxValue) * 140;

                return (
                  <View key={index} style={styles.barGroup}>
                    <View style={styles.barPair}>
                      <View style={[styles.bar, styles.incomeBar, { height: incomeHeight }]} />
                      <View style={[styles.bar, styles.expenseBar, { height: expenseHeight }]} />
                    </View>
                    <Text style={styles.barLabel}>{data.month}</Text>
                  </View>
                );
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
});
