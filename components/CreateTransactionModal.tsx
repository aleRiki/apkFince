import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (transaction: any) => Promise<void>;
}

const CATEGORIES = [
    { label: 'Alquiler', value: 'rent', icon: 'home' },
    { label: 'Comida', value: 'food_groceries', icon: 'shopping-cart' },
    { label: 'Entretenimiento', value: 'entertainment', icon: 'film' },
    { label: 'Transporte', value: 'transportation', icon: 'truck' },
    { label: 'Electricidad', value: 'utilities_electricity', icon: 'zap' },
    { label: 'Teléfono', value: 'utilities_phone', icon: 'phone' },
    { label: 'Internet', value: 'utilities_internet', icon: 'wifi' },
    { label: 'Deudas', value: 'debt_payment', icon: 'credit-card' },
    { label: 'Salud', value: 'health_care', icon: 'heart' },
    { label: 'Compras', value: 'shopping', icon: 'shopping-bag' },
    { label: 'Otros', value: 'other_expense', icon: 'more-horizontal' },
];

export default function CreateTransactionModal({ visible, onClose, onSubmit }: CreateTransactionModalProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('shopping');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!amount || !description) return;

        try {
            setLoading(true);
            await onSubmit({
                transactionType: 'withdraw',
                amount: parseFloat(amount),
                description,
                cardId: 13, // Default as per requirement
                category,
            });
            setAmount('');
            setDescription('');
            setCategory('shopping');
            onClose();
        } catch (error) {
            console.error('Error creating transaction:', error);
        } finally {
            setLoading(false);
        }
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
                        <Text style={styles.title}>Nuevo Gasto</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.form}>
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

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Compra semanal"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Categoría</Text>
                                <View style={styles.categoriesGrid}>
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.value}
                                            style={[
                                                styles.categoryItem,
                                                category === cat.value && styles.selectedCategory,
                                            ]}
                                            onPress={() => setCategory(cat.value)}
                                        >
                                            <Feather
                                                name={cat.icon as any}
                                                size={20}
                                                color={category === cat.value ? '#FFF' : appTheme.colors.textSecondary}
                                            />
                                            <Text
                                                style={[
                                                    styles.categoryLabel,
                                                    category === cat.value && styles.selectedCategoryLabel,
                                                ]}
                                            >
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Guardar Gasto</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
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
        padding: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: appTheme.colors.text,
    },
    form: {
        gap: 20,
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
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: appTheme.colors.backgroundCard,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    selectedCategory: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    categoryLabel: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
    },
    selectedCategoryLabel: {
        color: '#FFF',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: appTheme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
