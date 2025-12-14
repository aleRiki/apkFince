import { appTheme, formatCurrency } from '@/constants/appTheme';
import { Budget, BudgetUpdateData } from '@/types/budget';
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

interface EditBudgetProgressModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (budgetId: number, data: BudgetUpdateData) => void;
    budget: Budget | null;
}

export default function EditBudgetProgressModal({ visible, onClose, onSubmit, budget }: EditBudgetProgressModalProps) {
    const [progress, setProgress] = useState('');
    const [montoGastado, setMontoGastado] = useState('');

    useEffect(() => {
        if (visible && budget) {
            setProgress(budget.porcentajeCumplido?.toString() || '0');
            setMontoGastado(budget.montoGastado?.toString() || '0');
        }
    }, [visible, budget]);

    const handleSubmit = () => {
        const porcentajeCumplido = parseInt(progress);
        const monto = parseFloat(montoGastado);

        if (isNaN(porcentajeCumplido) || porcentajeCumplido < 0 || porcentajeCumplido > 100) {
            alert('El porcentaje debe estar entre 0 y 100');
            return;
        }

        if (isNaN(monto) || monto < 0) {
            alert('El monto gastado debe ser un número válido');
            return;
        }

        if (budget?.id) {
            onSubmit(budget.id, {
                porcentajeCumplido
            });
            onClose();
        }
    };

    const handleProgressChange = (text: string) => {
        setProgress(text);
        if (budget && text !== '') {
            const percent = parseFloat(text);
            if (!isNaN(percent)) {
                const calculatedMonto = (percent / 100) * budget.presupuesto;
                setMontoGastado(calculatedMonto.toFixed(2));
            }
        } else if (text === '') {
            setMontoGastado('');
        }
    };

    const handleMontoChange = (text: string) => {
        setMontoGastado(text);
        if (budget && text !== '') {
            const monto = parseFloat(text);
            if (!isNaN(monto)) {
                let calculatedPercent = (monto / budget.presupuesto) * 100;
                // Cap at 100 for display if needed, but allow calculation
                if (calculatedPercent > 100) calculatedPercent = 100;
                setProgress(Math.round(calculatedPercent).toString());
            }
        } else if (text === '') {
            setProgress('');
        }
    };

    const quickSetProgress = (value: number) => {
        setProgress(value.toString());
        if (budget) {
            const calculatedMonto = (value / 100) * budget.presupuesto;
            setMontoGastado(calculatedMonto.toFixed(2));
        }
    };

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
                        <Text style={styles.title}>Actualizar Progreso</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {budget && (
                        <View style={styles.budgetInfo}>
                            <Text style={styles.budgetName}>{budget.name}</Text>
                            <Text style={styles.budgetDescription}>{budget.description}</Text>
                        </View>
                    )}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Monto gastado (€)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                keyboardType="numeric"
                                value={montoGastado}
                                onChangeText={handleMontoChange}
                            />
                            {budget && (
                                <Text style={styles.budgetLimit}>
                                    de {formatCurrency(budget.presupuesto)} presupuestado
                                </Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Porcentaje cumplido (%)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0-100"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                keyboardType="numeric"
                                value={progress}
                                onChangeText={handleProgressChange}
                            />
                        </View>

                        <View style={styles.quickActions}>
                            <Text style={styles.quickActionsLabel}>Acceso rápido:</Text>
                            <View style={styles.quickButtons}>
                                {[0, 25, 50, 75, 100].map(value => (
                                    <TouchableOpacity
                                        key={value}
                                        style={[
                                            styles.quickButton,
                                            progress === value.toString() && styles.quickButtonActive
                                        ]}
                                        onPress={() => quickSetProgress(value)}
                                    >
                                        <Text style={[
                                            styles.quickButtonText,
                                            progress === value.toString() && styles.quickButtonTextActive
                                        ]}>
                                            {value}%
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Preview bar */}
                        <View style={styles.previewContainer}>
                            <Text style={styles.previewLabel}>Vista previa:</Text>
                            <View style={styles.previewBar}>
                                <View
                                    style={[
                                        styles.previewFill,
                                        { width: `${Math.min(Math.max(parseInt(progress) || 0, 0), 100)}%` }
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Actualizar Progreso</Text>
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
    budgetInfo: {
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    budgetName: {
        fontSize: 16,
        fontWeight: '700',
        color: appTheme.colors.text,
        marginBottom: 4,
    },
    budgetDescription: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
    },
    form: {
        gap: 20,
        marginBottom: 24,
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
    budgetLimit: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
        marginTop: 4,
    },
    quickActions: {
        gap: 8,
    },
    quickActionsLabel: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        fontWeight: '600',
    },
    quickButtons: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    quickButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: appTheme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    quickButtonActive: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    quickButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    quickButtonTextActive: {
        color: '#FFF',
    },
    previewContainer: {
        gap: 8,
    },
    previewLabel: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        fontWeight: '600',
    },
    previewBar: {
        height: 8,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    previewFill: {
        height: '100%',
        backgroundColor: appTheme.colors.primary,
        borderRadius: 4,
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
