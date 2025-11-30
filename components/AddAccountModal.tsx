import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (accountData: {
        name: string;
        type: string;
        balance: number;
        typeAccount: string;
        bankId: number;
    }) => void;
}

const CURRENCY_TYPES = [
    { id: 'USD', name: 'USD', icon: 'dollar-sign', color: '#10B981' },
    { id: 'EUR', name: 'EUR', icon: 'euro-sign', color: '#94A3B8' },
    { id: 'CUP', name: 'CUP', icon: 'dollar-sign', color: '#F97316' },
];

const ACCOUNT_TYPES = [
    { id: 'personal', name: 'Personal', icon: 'user' },
    { id: 'business', name: 'Empresarial', icon: 'briefcase' },
    { id: 'savings', name: 'Ahorros', icon: 'trending-up' },
];

export default function AddAccountModal({
    visible,
    onClose,
    onSubmit,
}: AddAccountModalProps) {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('CUP');
    const [selectedAccountType, setSelectedAccountType] = useState('personal');
    const [bankId, setBankId] = useState('1');

    useEffect(() => {
        if (visible) {
            // Reset form when modal opens
            setName('');
            setBalance('');
            setSelectedCurrency('CUP');
            setSelectedAccountType('personal');
            setBankId('1');
        }
    }, [visible]);

    const handleSubmit = () => {
        const numBalance = parseFloat(balance);
        const numBankId = parseInt(bankId);

        if (!name.trim()) {
            alert('Por favor ingresa un nombre para la cuenta');
            return;
        }

        if (!balance || isNaN(numBalance) || numBalance < 0) {
            alert('Por favor ingresa un saldo válido');
            return;
        }

        if (!bankId || isNaN(numBankId) || numBankId <= 0) {
            alert('Por favor ingresa un ID de banco válido');
            return;
        }

        onSubmit({
            name: name.trim(),
            type: selectedCurrency,
            balance: numBalance,
            typeAccount: selectedAccountType,
            bankId: numBankId,
        });

        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Agregar Cuenta</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.form}>
                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nombre de la Cuenta</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Cuenta Ahorros Principal"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* Balance Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Saldo Inicial</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    keyboardType="numeric"
                                    value={balance}
                                    onChangeText={setBalance}
                                />
                            </View>

                            {/* Currency Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tipo de Moneda</Text>
                                <View style={styles.optionsRow}>
                                    {CURRENCY_TYPES.map((currency) => (
                                        <TouchableOpacity
                                            key={currency.id}
                                            style={[
                                                styles.optionCard,
                                                selectedCurrency === currency.id && styles.optionCardSelected,
                                                { borderColor: currency.color },
                                            ]}
                                            onPress={() => setSelectedCurrency(currency.id)}
                                        >
                                            <View
                                                style={[
                                                    styles.optionIcon,
                                                    { backgroundColor: `${currency.color}20` },
                                                    selectedCurrency === currency.id && { backgroundColor: currency.color },
                                                ]}
                                            >
                                                <Feather
                                                    name={currency.icon as any}
                                                    size={18}
                                                    color={selectedCurrency === currency.id ? '#FFF' : currency.color}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.optionName,
                                                    selectedCurrency === currency.id && { color: currency.color },
                                                ]}
                                            >
                                                {currency.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Account Type Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tipo de Cuenta</Text>
                                <View style={styles.optionsColumn}>
                                    {ACCOUNT_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type.id}
                                            style={[
                                                styles.typeCard,
                                                selectedAccountType === type.id && styles.typeCardSelected,
                                            ]}
                                            onPress={() => setSelectedAccountType(type.id)}
                                        >
                                            <View
                                                style={[
                                                    styles.typeIcon,
                                                    selectedAccountType === type.id && styles.typeIconSelected,
                                                ]}
                                            >
                                                <Feather
                                                    name={type.icon as any}
                                                    size={20}
                                                    color={
                                                        selectedAccountType === type.id
                                                            ? '#FFF'
                                                            : appTheme.colors.primary
                                                    }
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.typeName,
                                                    selectedAccountType === type.id && styles.typeNameSelected,
                                                ]}
                                            >
                                                {type.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Bank ID Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>ID del Banco</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="1"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    keyboardType="numeric"
                                    value={bankId}
                                    onChangeText={setBankId}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Crear Cuenta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: appTheme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: appTheme.colors.text,
    },
    form: {
        gap: 20,
        marginBottom: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
        fontWeight: '600',
    },
    input: {
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        color: appTheme.colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionCard: {
        flex: 1,
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderWidth: 2,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    optionName: {
        fontSize: 13,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    optionsColumn: {
        gap: 8,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeCardSelected: {
        borderColor: appTheme.colors.primary,
        backgroundColor: `${appTheme.colors.primary}10`,
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${appTheme.colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    typeIconSelected: {
        backgroundColor: appTheme.colors.primary,
    },
    typeName: {
        fontSize: 15,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    typeNameSelected: {
        color: appTheme.colors.primary,
    },
    submitButton: {
        backgroundColor: appTheme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
