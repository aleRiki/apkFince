import { appTheme, formatCurrency } from '@/constants/appTheme';
import { Goal, GoalUpdateData } from '@/types/goal';
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

interface EditGoalProgressModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (goalId: number, data: GoalUpdateData) => void;
    goal: Goal | null;
}

export default function EditGoalProgressModal({ visible, onClose, onSubmit, goal }: EditGoalProgressModalProps) {
    const [progress, setProgress] = useState('');

    useEffect(() => {
        if (visible && goal) {
            setProgress(goal.progreso?.toString() || '0');
        }
    }, [visible, goal]);

    const handleSubmit = () => {
        const progreso = parseInt(progress);

        if (isNaN(progreso) || progreso < 0 || progreso > 100) {
            alert('El progreso debe estar entre 0 y 100');
            return;
        }

        if (goal?.id) {
            onSubmit(goal.id, { progreso });
            onClose();
        }
    };

    const quickSetProgress = (value: number) => {
        setProgress(value.toString());
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
                        <Text style={styles.title}>Actualizar Meta</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {goal && (
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalName}>{goal.name}</Text>
                            <Text style={styles.goalDescription}>{goal.description}</Text>
                            {goal.presupuesto && (
                                <View style={styles.budgetBadge}>
                                    <Feather name="dollar-sign" size={12} color={appTheme.colors.primary} />
                                    <Text style={styles.budgetName}>
                                        {goal.presupuesto.name}: {formatCurrency(goal.presupuesto.presupuesto)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Progreso de la meta (%)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0-100"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                keyboardType="numeric"
                                value={progress}
                                onChangeText={setProgress}
                            />
                            <Text style={styles.helperText}>
                                Indica qué tan cerca estás de completar esta meta
                            </Text>
                        </View>

                        <View style={styles.quickActions}>
                            <Text style={styles.quickActionsLabel}>Marcar como:</Text>
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
                                            {value === 100 ? 'Completado' : `${value}%`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Preview bar */}
                        <View style={styles.previewContainer}>
                            <Text style={styles.previewLabel}>Estado actual:</Text>
                            <View style={styles.previewBar}>
                                <View
                                    style={[
                                        styles.previewFill,
                                        {
                                            width: `${Math.min(Math.max(parseInt(progress) || 0, 0), 100)}%`,
                                            backgroundColor: parseInt(progress) >= 100 ? appTheme.colors.success : appTheme.colors.primary
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.previewStatus}>
                                {parseInt(progress) >= 100 ? '✅ ¡Meta alcanzada!' :
                                    parseInt(progress) > 0 ? '🚀 En progreso' : '⏳ Pendiente'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            parseInt(progress) >= 100 && styles.submitButtonSuccess
                        ]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>
                            {parseInt(progress) >= 100 ? 'Marcar Completada' : 'Guardar Progreso'}
                        </Text>
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
    goalInfo: {
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    goalName: {
        fontSize: 16,
        fontWeight: '700',
        color: appTheme.colors.text,
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        marginBottom: 8,
    },
    budgetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    budgetName: {
        fontSize: 12,
        color: appTheme.colors.primary,
        fontWeight: '600',
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
    helperText: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
        fontStyle: 'italic',
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: appTheme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        minWidth: 45,
        alignItems: 'center',
    },
    quickButtonActive: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    quickButtonText: {
        fontSize: 13,
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
    previewStatus: {
        fontSize: 13,
        color: appTheme.colors.text,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: appTheme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonSuccess: {
        backgroundColor: appTheme.colors.success,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
