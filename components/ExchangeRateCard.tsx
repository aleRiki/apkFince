import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ExchangeRateCardProps {
  currency: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number;
  previousRate?: number;
  index?: number;
}

export default function ExchangeRateCard({
  currency,
  name,
  symbol,
  flag,
  rate,
  previousRate,
  index = 0,
}: ExchangeRateCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const previousRateRef = useRef(previousRate ?? rate);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (previousRateRef.current !== rate) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      previousRateRef.current = rate;
    }
  }, [rate]);

  const change = previousRate ? ((rate - previousRate) / previousRate) * 100 : 0;
  const isUp = change >= 0;
  const gradientColors = isUp
    ? [appTheme.colors.success, appTheme.colors.accentDark]
    : [appTheme.colors.error, '#B91C1C'];

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[appTheme.colors.backgroundCard, 'rgba(30, 41, 59, 0.8)']}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <View style={styles.currencyInfo}>
            <Text style={styles.flag}>{flag}</Text>
            <View style={styles.currencyText}>
              <Text style={styles.currencyCode}>{currency}</Text>
              <Text style={styles.currencyName}>{name}</Text>
            </View>
          </View>
          <View style={[styles.changeBadge, { backgroundColor: isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
            <Feather name={isUp ? 'trending-up' : 'trending-down'} size={14} color={isUp ? appTheme.colors.success : appTheme.colors.error} />
            <Text style={[styles.changeText, { color: isUp ? appTheme.colors.success : appTheme.colors.error }]}>
              {change.toFixed(2)}%
            </Text>
          </View>
        </View>

        <View style={styles.rateRow}>
          <Text style={styles.rateSymbol}>{symbol}</Text>
          <Text style={styles.rateValue}>
            {rate.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </Text>
        </View>

        <View style={styles.footer}>
          <Feather name="refresh-cw" size={10} color={appTheme.colors.textSecondary} />
          <Text style={styles.updateText}>Tasa de referencia</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 28,
    marginRight: 10,
  },
  currencyText: {},
  currencyCode: {
    fontSize: 16,
    fontWeight: '800',
    color: appTheme.colors.text,
  },
  currencyName: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  rateSymbol: {
    fontSize: 24,
    fontWeight: '300',
    color: appTheme.colors.textSecondary,
    marginRight: 6,
  },
  rateValue: {
    fontSize: 28,
    fontWeight: '800',
    color: appTheme.colors.text,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updateText: {
    fontSize: 10,
    color: appTheme.colors.textSecondary,
  },
});
