import { appTheme } from '@/constants/appTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(formAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push('/(tabs)');
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#0F172A', '#0EA5A4', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <Feather name="dollar-sign" size={32} color="#0EA5A4" />
          </View>
          <Text style={styles.title}>FinanceHom</Text>
          <Text style={styles.subtitle}>Seguridad financiera para tu familia</Text>
        </Animated.View>

        <Animated.View style={[styles.formWrapper, { opacity: formAnim, transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Bienvenido de vuelta</Text>

            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={[styles.loginButton, loading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={loading}>
              <LinearGradient colors={['#0EA5A4', '#0D8F8E']} style={styles.loginGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                    <Feather name="arrow-right" size={18} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerLink}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, padding: 24, justifyContent: 'center' },
  decorCircle1: { position: 'absolute', top: -100, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(14, 165, 164, 0.08)' },
  decorCircle2: { position: 'absolute', bottom: -60, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(16, 185, 129, 0.06)' },
  content: { alignItems: 'center', marginBottom: 40 },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(14, 165, 164, 0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(14, 165, 164, 0.2)' },
  title: { fontSize: 30, fontWeight: '900', color: '#FFF', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  formWrapper: {},
  form: { backgroundColor: 'rgba(30, 41, 59, 0.85)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.1)' },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(51, 65, 85, 0.5)', borderRadius: 12, marginBottom: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.15)', height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 15, height: '100%' },
  eyeIcon: { padding: 6 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, padding: 10, marginBottom: 12, gap: 6 },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  loginButton: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  loginButtonDisabled: { opacity: 0.6 },
  loginGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, gap: 8 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { color: '#94A3B8', fontSize: 14 },
  registerLink: { color: '#0EA5A4', fontSize: 14, fontWeight: '700' },
});
