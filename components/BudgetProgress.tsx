import { appTheme, getPercentage } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetProgressProps {
  category: string;
  name: string;
  spent: number;
  budget: number;
  icon?: string;
  color?: string;
}

export default function BudgetProgress({
  category,
  name,
  spent,
  budget,
  icon = 'circle',
  color,
}: BudgetProgressProps) {
  const percentage = getPercentage(spent, budget);
  const barColor = color || appTheme.categoryColors[category as keyof typeof appTheme.categoryColors] || appTheme.colors.primary;
  
  // Determine status color based on percentage
  const getStatusColor = () => {
    if (percentage >= 90) return appTheme.colors.error;
    if (percentage >= 75) return appTheme.colors.warning;
    return appTheme.colors.success;
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={[styles.iconContainer, { backgroundColor: `${barColor}20` }]}>
            <Feather name={icon as any} size={20} color={barColor} />
          </View>
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.amount}>
              €{spent.toFixed(0)} / €{budget.toFixed(0)}
            </Text>
          </View>
        </View>
        
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color: statusColor }]}>
            {percentage}%
          </Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: statusColor,
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    color: appTheme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  amount: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
  },
  percentageContainer: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
