import { appTheme } from '@/constants/appTheme';
import { useTasasCambio } from '@/hooks/useTasasCambio';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
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
import ExchangeRateCard from '@/components/ExchangeRateCard';

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', CUP: '🇨🇺', MXN: '🇲🇽',
  BRL: '🇧🇷', COP: '🇨🇴', ARS: '🇦🇷', CLP: '🇨🇱',
  GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦', CHF: '🇨🇭',
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar', EUR: 'Euro', CUP: 'Peso Cubano', MXN: 'Peso Mexicano',
  BRL: 'Real Brasileño', COP: 'Peso Colombiano', ARS: 'Peso Argentino', CLP: 'Peso Chileno',
  GBP: 'Libra Esterlina', JPY: 'Yen Japonés', CAD: 'Dólar Canadiense', CHF: 'Franco Suizo',
};

export default function TasaCambioScreen() {
  const { rates, loading, error, refetch, autoRefresh, setAutoRefresh } = useTasasCambio();
  const headerAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, damping: 12 }).start();
  }, []);

  const enrichedRates = rates.map(r => ({
    ...r,
    flag: CURRENCY_FLAGS[r.currency] || '💱',
    name: CURRENCY_NAMES[r.currency] || r.currency,
  }));

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />

      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <View>
          <Text style={styles.title}>Tasas de Cambio</Text>
          <Text style={styles.subtitle}>Monedas referenciales</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAutoRefresh(!autoRefresh)}
          style={[styles.autoBtn, autoRefresh && styles.autoBtnActive]}
        >
          <Feather name="radio" size={16} color={autoRefresh ? appTheme.colors.primary : appTheme.colors.textSecondary} />
          <Text style={[styles.autoBtnText, autoRefresh && styles.autoBtnTextActive]}>
            Auto
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={appTheme.colors.primary}
          />
        }
      >
        {loading && rates.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appTheme.colors.primary} />
            <Text style={styles.loadingText}>Cargando tasas...</Text>
          </View>
        ) : error && rates.length === 0 ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color={appTheme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <LinearGradient
              colors={['rgba(14, 165, 164, 0.1)', 'rgba(14, 165, 164, 0.02)']}
              style={styles.summaryBanner}
            >
              <View style={styles.summaryContent}>
                <Feather name="info" size={16} color={appTheme.colors.primary} />
                <Text style={styles.summaryText}>
                  {enrichedRates.length} moneda{enrichedRates.length !== 1 ? 's' : ''} disponible{enrichedRates.length !== 1 ? 's' : ''}
                  {autoRefresh ? ' · Actualización automática cada 30s' : ''}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.ratesList}>
              {enrichedRates.map((rate, idx) => (
                <ExchangeRateCard
                  key={rate.currency}
                  currency={rate.currency}
                  name={rate.name}
                  symbol={rate.symbol}
                  flag={rate.flag}
                  rate={rate.rate}
                  index={idx}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: appTheme.colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '900', color: appTheme.colors.text },
  subtitle: { fontSize: 14, color: appTheme.colors.textSecondary, marginTop: 2 },
  autoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: appTheme.colors.backgroundCard,
    gap: 6,
  },
  autoBtnActive: {
    borderColor: appTheme.colors.primary,
    borderWidth: 1,
  },
  autoBtnText: { fontSize: 12, fontWeight: '600', color: appTheme.colors.textSecondary },
  autoBtnTextActive: { color: appTheme.colors.primary },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  loadingText: { marginTop: 12, fontSize: 14, color: appTheme.colors.textSecondary },
  errorContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  errorText: { marginTop: 12, fontSize: 14, color: appTheme.colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: appTheme.colors.primary,
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  summaryBanner: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    flex: 1,
  },
  ratesList: {
    paddingHorizontal: 20,
  },
});
