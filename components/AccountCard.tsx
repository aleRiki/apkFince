import { formatCurrency } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AccountCardProps {
  name: string;
  bank: string;
  lastDigits: string;
  balance: number;
  colors: string[];
  currency?: string;
  onPress?: () => void;
}

function CardChip() {
  return (
    <View style={styles.chip}>
      <View style={styles.chipInner} />
    </View>
  );
}

function NetworkLogo({ type }: { type: string }) {
  const isVisa = type.toUpperCase().includes('VISA');
  return (
    <View style={styles.networkRow}>
      <View style={[styles.networkCircle, { backgroundColor: '#FF0000', marginRight: -6 }]} />
      <View style={[styles.networkCircle, { backgroundColor: '#F9A000' }]} />
    </View>
  );
}

export default function AccountCard({
  name, bank, lastDigits, balance, colors, currency = 'EUR', onPress,
}: AccountCardProps) {
  const cardType = bank.toUpperCase();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={colors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.cardBgCircle1} />
          <View style={styles.cardBgCircle2} />
          <View style={styles.cardBgGlow} />
        </View>

        <View style={styles.topRow}>
          <CardChip />
          <NetworkLogo type={cardType} />
        </View>

        <View style={styles.numberRow}>
          <Text style={styles.numberGroup}>••••</Text>
          <Text style={styles.numberGroup}>••••</Text>
          <Text style={styles.numberGroup}>••••</Text>
          <Text style={styles.numberGroup}>{lastDigits}</Text>
        </View>

        <View style={styles.midRow}>
          <View style={styles.cardHolder}>
            <Text style={styles.label}>TITULAR</Text>
            <Text style={styles.value} numberOfLines={1}>{name.toUpperCase()}</Text>
          </View>
          <View style={styles.expiryContainer}>
            <Text style={styles.label}>VENCE</Text>
            <Text style={styles.value}>12/28</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
            <Text style={styles.balance}>{formatCurrency(balance, currency)}</Text>
          </View>
          <Feather name="credit-card" size={20} color="rgba(255,255,255,0.3)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    justifyContent: 'space-between',
    marginRight: 16,
    width: 290,
    overflow: 'hidden',
  },
  cardBgCircle1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardBgCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cardBgGlow: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: '60%',
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    width: 36,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#FFC72C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  chipInner: {
    width: 18,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#D4A823',
    borderWidth: 0.5,
    borderColor: '#B8951E',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  numberRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  numberGroup: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  midRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  cardHolder: {
    flex: 1,
    marginRight: 16,
  },
  expiryContainer: {
    alignItems: 'flex-end',
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  balance: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
