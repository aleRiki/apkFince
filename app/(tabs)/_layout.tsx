import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: appTheme.colors.backgroundCard,
          borderTopColor: 'rgba(148, 163, 184, 0.2)',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: t('tabs.accounts'),
          tabBarIcon: ({ color }) => <Feather name="credit-card" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: t('tabs.budgets'),
          tabBarIcon: ({ color }) => <Feather name="pie-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabs.analytics'),
          tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasacambio"
        options={{
          title: t('tabs.rates'),
          tabBarIcon: ({ color }) => <Feather name="dollar-sign" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sumbank"
        options={{
          title: t('tabs.sumbank'),
          tabBarIcon: ({ color }) => <Feather name="shield" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
