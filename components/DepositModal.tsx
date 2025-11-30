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

interface DepositModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (depositData: {
        transactionType: string;
        amount: number;
        description: string;
        cardId: number;
        category: string;
    }) => void;
    cardId: number;
    cardName?: string;
}

const INCOME_CATEGORIES = [
    { id: 'salary', name: 'Salario', icon: 'briefcase' },
    { id: 'investment', name: 'Inversión', icon: 'trending-up' },
    { id: 'bonus', name: 'Bonificación', icon: 'gift' },
    { id: 'refund', name: 'Reembolso', icon: 'rotate-ccw' },
    { id: 'other_income', name: 'Otros Ingresos', icon: 'plus-circle' },
];

export default function DepositModal({
    visible,
    onClose,
    onSubmit,
    cardId,
    cardName,
}: DepositModalProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('salary');

    useEffect(() => {
        if (visible) {
            // Reset form when modal opens
            setAmount('');
            setDescription('');
            setSelectedCategory('salary');
        }
    }, [visible]);

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);

        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            alert('Por favor ingresa un monto válido');
            return;
        }

        if (!description.trim()) {
            alert('Por favor ingresa una descripción');
            return;
        }

        onSubmit({
            transactionType: 'deposit',
            amount: numAmount,
            description: description.trim(),
            cardId,
            category: selectedCategory,
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
                        <View>
                            <Text style={styles.title}>Registrar Ingreso</Text>
                            {cardName && <Text style={styles.subtitle}>{cardName}</Text>}
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.form}>
                            {/* Amount Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Monto (€)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Pago de nómina"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            {/* Category Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Categoría de Ingreso</Text>
                                <View style={styles.categoriesGrid}>
                                    {INCOME_CATEGORIES.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[
                                                styles.categoryCard,
                                                selectedCategory === category.id && styles.categoryCardSelected,
                                            ]}
                                            onPress={() => setSelectedCategory(category.id)}
                                        >
                                            <View
                                                style={[
                                                    styles.categoryIcon,
                                                    selectedCategory === category.id && styles.categoryIconSelected,
                                                ]}
                                            >
                                                <Feather
                                                    name={category.icon as any}
                                                    size={20}
                                                    color={
                                                        selectedCategory === category.id
                                                            ? '#FFF'
                                                            : appTheme.colors.primary
                                                    }
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.categoryName,
                                                    selectedCategory === category.id && styles.categoryNameSelected,
                                                ]}
                                            >
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Registrar Ingreso</Text>
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
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: appTheme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
        marginTop: 4,
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
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: '48%',
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryCardSelected: {
        borderColor: appTheme.colors.primary,
        backgroundColor: `${appTheme.colors.primary}10`,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${appTheme.colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    categoryIconSelected: {
        backgroundColor: appTheme.colors.primary,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: '600',
        color: appTheme.colors.text,
        textAlign: 'center',
    },
    categoryNameSelected: {
        color: appTheme.colors.primary,
    },
    submitButton: {
        backgroundColor: appTheme.colors.success,
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
