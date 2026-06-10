import { appTheme } from '@/constants/appTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { Tabs, useSegments, router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MENU_ITEMS: {
  name: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
}[] = [
  { name: 'index', icon: 'home', label: 'Inicio' },
  { name: 'accounts', icon: 'credit-card', label: 'Cuentas' },
  { name: 'budgets', icon: 'pie-chart', label: 'Presupuestos' },
  { name: 'analytics', icon: 'bar-chart-2', label: 'Análisis' },

  { name: 'settings', icon: 'settings', label: 'Ajustes' },
];

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  );
}

function TopMenu() {
  const [visible, setVisible] = useState(false);
  const segments = useSegments();
  const currentTab = segments[1] || 'index';
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const currentItem = MENU_ITEMS.find((i) => i.name === currentTab);

  const navigate = (name: string) => {
    setVisible(false);
    const routes: Record<string, any> = {
      index: '/',
      accounts: '/(tabs)/accounts',
      budgets: '/(tabs)/budgets',
      analytics: '/(tabs)/analytics',
      tasacambio: '/(tabs)/tasacambio',
      sumbank: '/(tabs)/sumbank',
      settings: '/(tabs)/settings',
    };
    const target = routes[name];
    if (target) router.replace(target);
  };

  return (
    <>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarContent}>
          <Feather
            name={currentItem?.icon || 'home'}
            size={20}
            color={appTheme.colors.text}
          />
          <Text style={styles.topBarTitle}>{currentItem?.label || 'App'}</Text>
        </View>
        <View style={styles.topBarActions}>
          <Pressable style={styles.iconButton}>
            <Feather
              name='bell'
              size={22}
              color={appTheme.colors.textSecondary}
            />
          </Pressable>
          <Pressable onPress={() => setVisible(true)} style={styles.iconButton}>
            <Feather
              name='more-vertical'
              size={24}
              color={appTheme.colors.text}
            />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType='fade'
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.dropdown, { top: insets.top + 60, right: 16 }]}>
            <View style={styles.userHeader}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {getInitials(user?.name || 'U')}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {MENU_ITEMS.map((item) => {
              const isActive = currentTab === item.name;
              return (
                <Pressable
                  key={item.name}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => navigate(item.name)}
                >
                  <Feather
                    name={item.icon}
                    size={18}
                    color={
                      isActive
                        ? appTheme.colors.primary
                        : appTheme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.menuLabel,
                      isActive && styles.menuLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isActive && (
                    <Feather
                      name='check'
                      size={14}
                      color={appTheme.colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}

            <View style={styles.divider} />

            <Pressable
              style={styles.logoutItem}
              onPress={() => {
                setVisible(false);
                logout();
              }}
            >
              <Feather name='log-out' size={18} color='#EF4444' />
              <Text style={styles.logoutLabel}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={() => null} screenOptions={{ header: () => <TopMenu /> }}>
      <Tabs.Screen name='index' />
      <Tabs.Screen name='accounts' />
      <Tabs.Screen name='budgets' />
      <Tabs.Screen name='analytics' />
      <Tabs.Screen name='tasacambio' />
      <Tabs.Screen name='sumbank' />
      <Tabs.Screen name='explore' options={{ href: null }} />
      <Tabs.Screen name='settings' />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: appTheme.colors.background,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appTheme.colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: appTheme.colors.backgroundCard,
    borderRadius: 16,
    paddingVertical: 4,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: appTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: appTheme.colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: appTheme.colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: appTheme.colors.textSecondary,
  },
  menuLabelActive: {
    color: appTheme.colors.primary,
    fontWeight: '600',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logoutLabel: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '500',
  },
});
