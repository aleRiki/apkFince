import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const slideTitle = useRef(new Animated.Value(30)).current;
  const fadeFeatures = useRef(new Animated.Value(0)).current;
  const slideButton = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeLogo, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideTitle, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(fadeFeatures, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideButton, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const features = [
    { icon: 'users', title: 'Control Familiar', desc: 'Gestiona las finanzas de toda tu familia en un solo lugar' },
    { icon: 'shield', title: 'Seguridad Financiera', desc: 'Protege y organiza el ahorro de tus seres queridos' },
    { icon: 'trending-up', title: 'Metas Compartidas', desc: 'Establece objetivos financieros en equipo' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />
      <LinearGradient
        colors={['#0F172A', '#0D8F8E', '#0F172A']}
        style={styles.gradient}
      >
        <View style={styles.decorTop} />
        <View style={styles.decorBottom} />

        <View style={styles.content}>
          <Animated.View style={[styles.logoSection, { opacity: fadeLogo, transform: [{ translateY: slideTitle }] }]}>
            <View style={styles.logoContainer}>
              <Feather name="dollar-sign" size={36} color="#0EA5A4" />
            </View>
            <Text style={styles.appName}>FinanceHom</Text>
            <Text style={styles.tagline}>Seguridad financiera para tu familia</Text>
          </Animated.View>

          <Animated.View style={[styles.featuresSection, { opacity: fadeFeatures }]}>
            <Text style={styles.missionTitle}>Nuestro objetivo</Text>
            <Text style={styles.missionText}>
              Brindar a las familias una herramienta simple y poderosa para controlar sus finanzas,
              establecer metas de ahorro y construir un futuro financiero sólido juntos.
            </Text>

            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon as any} size={18} color="#0EA5A4" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.bottomSection, { transform: [{ translateY: slideButton }] }]}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0EA5A4', '#0D8F8E']}
                style={styles.loginBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={styles.registerBtnText}>Crear una cuenta</Text>
            </TouchableOpacity>

            <Text style={styles.devCredit}>
              Desarrollado por{' '}
              <Text style={styles.devName}>Leandro R. R.</Text>
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: appTheme.colors.background },
  gradient: { flex: 1 },
  decorTop: { position: 'absolute', top: -120, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(14, 165, 164, 0.06)' },
  decorBottom: { position: 'absolute', bottom: -80, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(16, 185, 129, 0.04)' },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingVertical: 20 },
  logoSection: { alignItems: 'center', paddingTop: 20 },
  logoContainer: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(14, 165, 164, 0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(14, 165, 164, 0.2)' },
  appName: { fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 8 },
  tagline: { fontSize: 15, color: '#94A3B8', textAlign: 'center' },
  featuresSection: { flex: 1, justifyContent: 'center', paddingVertical: 20 },
  missionTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  missionText: { fontSize: 14, color: '#94A3B8', lineHeight: 22, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(14, 165, 164, 0.1)', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  featureDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 18 },
  bottomSection: { gap: 12, paddingBottom: 10 },
  loginBtn: { borderRadius: 14, overflow: 'hidden' },
  loginBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 54, gap: 8 },
  loginBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  registerBtn: { alignItems: 'center', paddingVertical: 14 },
  registerBtnText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  devCredit: { textAlign: 'center', color: '#64748B', fontSize: 12, marginTop: 8 },
  devName: { color: '#0EA5A4', fontWeight: '700' },
});
