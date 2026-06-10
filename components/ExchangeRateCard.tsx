import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
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
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const previousRateRef = useRef(previousRate ?? rate);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (previousRateRef.current !== rate) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      previousRateRef.current = rate;
    }
  }, [rate]);

  const change = previousRate ? ((rate - previousRate) / previousRate) * 100 : 0;
  const isUp = change >= 0;

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
      <View style={styles.left}>
        <Text style={styles.flag}>{flag}</Text>
        <View>
          <Text style={styles.code}>{currency}</Text>
          <Text style={styles.rate}>
            <Text style={styles.symbol}>{symbol}</Text>
            {' '}
            {rate.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </Text>
        </View>
      </View>
      {previousRate && (
        <View style={[styles.badge, { backgroundColor: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }]}>
          <Feather name={isUp ? 'trending-up' : 'trending-down'} size={12} color={isUp ? appTheme.colors.success : appTheme.colors.error} />
          <Text style={[styles.badgeText, { color: isUp ? appTheme.colors.success : appTheme.colors.error }]}>
            {change.toFixed(2)}%
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.06)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flag: {
    fontSize: 20,
  },
  code: {
    fontSize: 13,
    fontWeight: '700',
    color: appTheme.colors.text,
    marginBottom: 1,
  },
  rate: {
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.textSecondary,
  },
  symbol: {
    fontWeight: '400',
    color: appTheme.colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
