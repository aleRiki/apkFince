import { appTheme } from '@/constants/appTheme';
import { useAccounts } from '@/hooks/useAccounts';
import { useBanks } from '@/hooks/useBanks';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function FadeSlide({ children, delay = 0 }: { children: any; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

export default function BankManagementScreen() {
  const { banks, loading: banksLoading, addBank, refetch: refetchBanks } = useBanks();
  const { accounts, loading: accLoading, refetch: refetchAccounts } = useAccounts();
  const [refreshing, setRefreshing] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newBank, setNewBank] = useState({ name: '', address: '' });
  const [newAccount, setNewAccount] = useState({ name: '', type: 'USD', balance: '0', typeAccount: 'personal', bankId: 0 });
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateBank = async () => {
    if (!newBank.name || !newBank.address) { Alert.alert('Error', 'Completa todos los campos'); return; }
    setActionLoading(true);
    try {
      await addBank(newBank);
      setNewBank({ name: '', address: '' });
      setShowBankForm(false);
      Alert.alert('Éxito', 'Banco creado correctamente');
    } catch { Alert.alert('Error', 'Error al crear el banco'); }
    finally { setActionLoading(false); }
  };

  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.bankId) { Alert.alert('Error', 'Completa todos los campos'); return; }
    setActionLoading(true);
    try {
      await api.post('/api/v1/accounts', {
        name: newAccount.name,
        type: newAccount.type,
        balance: parseFloat(newAccount.balance) || 0,
        typeAccount: newAccount.typeAccount,
        bankId: newAccount.bankId,
      });
      setNewAccount({ name: '', type: 'USD', balance: '0', typeAccount: 'personal', bankId: 0 });
      setShowAccountForm(false);
      await refetchAccounts();
      Alert.alert('Éxito', 'Cuenta creada correctamente');
    } catch { Alert.alert('Error', 'Error al crear la cuenta'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteBank = (id: number) => {
    Alert.alert('Eliminar banco', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/api/v1/bank/${id}`);
          await refetchBanks();
        } catch { Alert.alert('Error', 'Error al eliminar'); }
      }},
    ]);
  };

  const handleDeleteAccount = (id: number) => {
    Alert.alert('Eliminar cuenta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/api/v1/accounts/${id}`);
          await refetchAccounts();
        } catch { Alert.alert('Error', 'Error al eliminar'); }
      }},
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBanks(), refetchAccounts()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>Gestión Bancaria</Text>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={appTheme.colors.primary} />}
      >
        {/* Create Bank */}
        <FadeSlide>
          <TouchableOpacity style={styles.addCard} onPress={() => setShowBankForm(!showBankForm)}>
            <Feather name="shield" size={20} color={appTheme.colors.primary} />
            <Text style={styles.addCardText}>Nuevo Banco</Text>
            <Feather name={showBankForm ? 'chevron-up' : 'chevron-down'} size={20} color={appTheme.colors.textSecondary} />
          </TouchableOpacity>
        </FadeSlide>

        {showBankForm && (
          <FadeSlide delay={50}>
            <View style={styles.formCard}>
              <TextInput style={styles.input} placeholder="Nombre del banco" placeholderTextColor={appTheme.colors.textSecondary}
                value={newBank.name} onChangeText={t => setNewBank({ ...newBank, name: t })} />
              <TextInput style={styles.input} placeholder="Dirección" placeholderTextColor={appTheme.colors.textSecondary}
                value={newBank.address} onChangeText={t => setNewBank({ ...newBank, address: t })} />
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateBank} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Crear Banco</Text>}
              </TouchableOpacity>
            </View>
          </FadeSlide>
        )}

        {/* Create Account */}
        <FadeSlide delay={50}>
          <TouchableOpacity style={styles.addCard} onPress={() => setShowAccountForm(!showAccountForm)}>
            <Feather name="briefcase" size={20} color={appTheme.colors.accent} />
            <Text style={styles.addCardText}>Nueva Cuenta</Text>
            <Feather name={showAccountForm ? 'chevron-up' : 'chevron-down'} size={20} color={appTheme.colors.textSecondary} />
          </TouchableOpacity>
        </FadeSlide>

        {showAccountForm && (
          <FadeSlide delay={80}>
            <View style={styles.formCard}>
              <TextInput style={styles.input} placeholder="Nombre de la cuenta" placeholderTextColor={appTheme.colors.textSecondary}
                value={newAccount.name} onChangeText={t => setNewAccount({ ...newAccount, name: t })} />
              <View style={styles.row}>
                <View style={styles.pickerRow}>
                  {['USD', 'EUR', 'CUP'].map(curr => (
                    <TouchableOpacity key={curr} style={[styles.pickerBtn, newAccount.type === curr && styles.pickerActive]}
                      onPress={() => setNewAccount({ ...newAccount, type: curr })}>
                      <Text style={[styles.pickerText, newAccount.type === curr && styles.pickerTextActive]}>{curr}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Saldo" placeholderTextColor={appTheme.colors.textSecondary}
                  value={newAccount.balance} onChangeText={t => setNewAccount({ ...newAccount, balance: t })} keyboardType="decimal-pad" />
              </View>
              <View style={styles.pickerRow}>
                {['personal', 'familiar'].map(t => (
                  <TouchableOpacity key={t} style={[styles.pickerBtn, newAccount.typeAccount === t && styles.pickerActive]}
                    onPress={() => setNewAccount({ ...newAccount, typeAccount: t })}>
                    <Text style={[styles.pickerText, newAccount.typeAccount === t && styles.pickerTextActive]}>
                      {t === 'personal' ? 'Personal' : 'Familiar'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.bankSelector}>
                <Text style={styles.bankSelectorLabel}>Banco:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.bankChips}>
                    <TouchableOpacity key={0} style={[styles.bankChip, newAccount.bankId === 0 && styles.bankChipActive]} onPress={() => setNewAccount({ ...newAccount, bankId: 0 })}>
                      <Text style={[styles.bankChipText, newAccount.bankId === 0 && styles.bankChipTextActive]}>Seleccionar</Text>
                    </TouchableOpacity>
                    {banks.map(b => (
                      <TouchableOpacity key={b.id} style={[styles.bankChip, newAccount.bankId === b.id && styles.bankChipActive]}
                        onPress={() => setNewAccount({ ...newAccount, bankId: b.id })}>
                        <Text style={[styles.bankChipText, newAccount.bankId === b.id && styles.bankChipTextActive]}>{b.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: appTheme.colors.accent }]} onPress={handleCreateAccount} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Crear Cuenta</Text>}
              </TouchableOpacity>
            </View>
          </FadeSlide>
        )}

        {/* Banks List */}
        <FadeSlide delay={100}>
          <View style={styles.listSection}>
            <Text style={styles.listSectionTitle}>Bancos ({banks.length})</Text>
            {banksLoading ? (
              <ActivityIndicator color={appTheme.colors.primary} />
            ) : banks.length === 0 ? (
              <Text style={styles.emptyText}>No hay bancos registrados</Text>
            ) : (
              banks.map(bank => (
                <View key={bank.id} style={[styles.entityCard, styles.bankCard]}>
                  <View style={styles.entityInfo}>
<Feather name="shield" size={20} color={appTheme.colors.primary} />
                    <View style={styles.entityText}>
                      <Text style={styles.entityName}>{bank.name}</Text>
                      <Text style={styles.entityDetail}>{bank.address}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteBank(bank.id)} style={styles.deleteBtn}>
                    <Feather name="trash-2" size={18} color={appTheme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </FadeSlide>

        {/* Accounts List */}
        <FadeSlide delay={150}>
          <View style={styles.listSection}>
            <Text style={styles.listSectionTitle}>Cuentas ({accounts.length})</Text>
            {accLoading ? (
              <ActivityIndicator color={appTheme.colors.primary} />
            ) : accounts.length === 0 ? (
              <Text style={styles.emptyText}>No hay cuentas registradas</Text>
            ) : (
              accounts.map(acc => (
                <View key={acc.id} style={[styles.entityCard, styles.accountCard]}>
                  <View style={styles.entityInfo}>
<Feather name="briefcase" size={20} color={appTheme.colors.accent} />
                    <View style={styles.entityText}>
                      <Text style={styles.entityName}>{acc.name}</Text>
                      <Text style={styles.entityDetail}>Saldo: {acc.balance} {acc.currency}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAccount(Number(acc.id))} style={styles.deleteBtn}>
                    <Feather name="trash-2" size={18} color={appTheme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </FadeSlide>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: appTheme.colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', color: appTheme.colors.text },
  addCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: appTheme.colors.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 8 },
  addCardText: { flex: 1, fontSize: 15, fontWeight: '600', color: appTheme.colors.text, marginLeft: 12 },
  formCard: { backgroundColor: appTheme.colors.backgroundCard, borderRadius: 12, padding: 16, marginBottom: 8, gap: 10 },
  input: { backgroundColor: 'rgba(51,65,85,0.6)', borderRadius: 10, padding: 12, fontSize: 14, color: appTheme.colors.text, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  row: { flexDirection: 'row', gap: 8 },
  pickerRow: { flexDirection: 'row', gap: 6 },
  pickerBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(148,163,184,0.1)' },
  pickerActive: { backgroundColor: appTheme.colors.primary },
  pickerText: { fontSize: 13, fontWeight: '600', color: appTheme.colors.textSecondary },
  pickerTextActive: { color: '#FFF' },
  bankSelector: { gap: 8 },
  bankSelectorLabel: { fontSize: 13, fontWeight: '600', color: appTheme.colors.textSecondary },
  bankChips: { flexDirection: 'row', gap: 6 },
  bankChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(148,163,184,0.1)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  bankChipActive: { borderColor: appTheme.colors.primary, backgroundColor: 'rgba(14,165,164,0.15)' },
  bankChipText: { fontSize: 12, fontWeight: '500', color: appTheme.colors.textSecondary },
  bankChipTextActive: { color: appTheme.colors.primary },
  submitBtn: { backgroundColor: appTheme.colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  listSection: { marginTop: 16 },
  listSectionTitle: { fontSize: 18, fontWeight: '700', color: appTheme.colors.text, marginBottom: 12 },
  emptyText: { fontSize: 14, color: appTheme.colors.textSecondary, textAlign: 'center', padding: 20 },
  entityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4 },
  bankCard: { backgroundColor: appTheme.colors.backgroundCard, borderLeftColor: appTheme.colors.primary },
  accountCard: { backgroundColor: appTheme.colors.backgroundCard, borderLeftColor: appTheme.colors.accent },
  entityInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  entityText: { flex: 1 },
  entityName: { fontSize: 15, fontWeight: '700', color: appTheme.colors.text },
  entityDetail: { fontSize: 13, color: appTheme.colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)' },
});
