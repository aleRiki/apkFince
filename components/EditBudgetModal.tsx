import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditBudgetModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (newLimit: number) => void;
    currentBudget: {
        name: string;
        budget: number;
    } | null;
}

export default function EditBudgetModal({ visible, onClose, onSubmit, currentBudget }: EditBudgetModalProps) {
    const [limit, setLimit] = useState('');

    useEffect(() => {
        if (currentBudget) {
            setLimit(currentBudget.budget.toString());
        }
    }, [currentBudget]);

    const handleSubmit = () => {
        const newLimit = parseFloat(limit);
        if (!isNaN(newLimit) && newLimit > 0) {
            onSubmit(newLimit);
            onClose();
        }
    };

    if (!currentBudget) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Presupuesto</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>
                        Define el límite mensual para <Text style={styles.highlight}>{currentBudget.name}</Text>
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Límite (€)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={appTheme.colors.textSecondary}
                            keyboardType="numeric"
                            value={limit}
                            onChangeText={setLimit}
                            autoFocus
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Guardar Cambios</Text>
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
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: appTheme.colors.background,
        borderRadius: 24,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: appTheme.colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: appTheme.colors.textSecondary,
        marginBottom: 24,
    },
    highlight: {
        color: appTheme.colors.primary,
        fontWeight: '700',
    },
    inputGroup: {
        gap: 8,
        marginBottom: 24,
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
        fontSize: 24,
        fontWeight: '700',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        textAlign: 'center',
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
