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

export default function AccountCard({
    name,
    bank,
    lastDigits,
    balance,
    colors,
    currency = 'EUR',
    onPress,
}: AccountCardProps) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.header}>
                    <Text style={styles.bank}>{bank}</Text>
                    <Feather name="credit-card" size={24} color="rgba(255,255,255,0.9)" />
                </View>

                <View style={styles.content}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.number}>•••• {lastDigits}</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.balanceLabel}>Saldo</Text>
                    <Text style={styles.balance}>{formatCurrency(balance, currency)}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        minHeight: 160,
        justifyContent: 'space-between',
        marginRight: 16,
        width: 280,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bank: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    content: {
        marginTop: 12,
    },
    name: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    number: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 2,
    },
    footer: {
        marginTop: 16,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 4,
    },
    balance: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
    },
});
