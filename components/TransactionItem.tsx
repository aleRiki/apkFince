import { appTheme, formatCurrency, formatDate } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TransactionItemProps {
  category: string;
  name: string;
  description?: string;
  amount: number;
  date: Date;
  icon?: string;
}

const categoryIcons: Record<string, string> = {
  supermercado: 'shopping-cart',
  salario: 'dollar-sign',
  restaurante: 'coffee',
  transporte: 'truck',
  ocio: 'smile',
  hogar: 'home',
  otros: 'more-horizontal',
};

const getCategoryColor = (category: string): string => {
  return appTheme.categoryColors[category as keyof typeof appTheme.categoryColors] || '#64748B';
};

export default function TransactionItem({
  category,
  name,
  description,
  amount,
  date,
  icon,
}: TransactionItemProps) {
  const isPositive = amount >= 0;
  const categoryColor = getCategoryColor(category);
  const iconName = icon || categoryIcons[category] || 'circle';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
        <Feather name={iconName as any} size={20} color={categoryColor} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isPositive ? styles.positive : styles.negative]}>
          {isPositive ? '+' : ''}{formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    color: appTheme.colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  date: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: appTheme.colors.success,
  },
  negative: {
    color: appTheme.colors.error,
  },
});
