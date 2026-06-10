import { appTheme, formatCurrency } from '@/constants/appTheme';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TaskUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface TaskDetail {
    id: number;
    title: string;
    description: string;
    type: string;
    isCompleted: boolean;
    spentAmount: number;
    presupuesto: {
        id: number;
        name: string;
        presupuesto: number;
        card?: { id: number; balance: string };
    };
    users: TaskUser[];
}

interface TaskDetailModalProps {
    visible: boolean;
    taskId: string | null;
    onClose: () => void;
    onDelete?: () => void;
    onComplete?: (taskId: string, amount: number) => void;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    'compras': { label: 'Compras', icon: 'shopping-cart', color: '#10B981' },
    'pagos de servicios': { label: 'Pagos/Servicios', icon: 'file-text', color: '#F59E0B' },
    'personal': { label: 'Personal', icon: 'user', color: '#8B5CF6' },
    'hogar': { label: 'Hogar', icon: 'home', color: '#3B82F6' },
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    visible,
    taskId,
    onClose,
    onDelete,
    onComplete,
}) => {
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [completionAmount, setCompletionAmount] = useState('');

    useEffect(() => {
        if (visible && taskId) {
            fetchTaskDetail();
            setCompletionAmount('');
        }
    }, [visible, taskId]);

    const fetchTaskDetail = async () => {
        if (!taskId) return;
        setLoading(true);
        try {
            const data = await api.get(`/api/v1/taskt/${taskId}`);
            setTask(data);
        } catch (error) {
            console.error('Error fetching task detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!task || !taskId) return;
        Alert.alert(
            'Eliminar Tarea',
            '¿Estás seguro de que deseas eliminar esta tarea?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await api.delete(`/api/v1/taskt/${taskId}`);
                            onDelete?.();
                            handleClose();
                        } catch (error) {
                            console.error('Error deleting task:', error);
                            Alert.alert('Error', 'No se pudo eliminar la tarea');
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleComplete = async () => {
        if (!taskId) return;
        const amount = parseFloat(completionAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Error', 'Ingresa un monto válido');
            return;
        }
        setCompleting(true);
        try {
            await api.patch(`/api/v1/taskt/${taskId}/completed`, { amount });
            onComplete?.(taskId, amount);
            handleClose();
        } catch (error: any) {
            console.error('Error completing task:', error);
            Alert.alert('Error', error?.message || 'No se pudo completar la tarea. Verifica fondos suficientes.');
        } finally {
            setCompleting(false);
        }
    };

    const handleClose = () => {
        setTask(null);
        setCompletionAmount('');
        onClose();
    };

    const typeConfig = task ? (TYPE_CONFIG[task.type?.toLowerCase()] || { label: task.type || 'Otro', icon: 'more-horizontal', color: '#6B7280' }) : { label: 'Otro', icon: 'more-horizontal', color: '#6B7280' };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Detalle de Tarea</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={appTheme.colors.primary} />
                        </View>
                    ) : task ? (
                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: task.isCompleted ? appTheme.colors.success : appTheme.colors.warning }
                            ]}>
                                <Feather
                                    name={task.isCompleted ? "check-circle" : "clock"}
                                    size={16}
                                    color="#FFF"
                                />
                                <Text style={styles.statusText}>
                                    {task.isCompleted ? 'Completada' : 'Pendiente'}
                                </Text>
                            </View>

                            <Text style={styles.taskTitle}>{task.title}</Text>

                            {task.description && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Descripción</Text>
                                    <Text style={styles.descriptionText}>{task.description}</Text>
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Tipo</Text>
                                <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
                                    <Feather name={typeConfig.icon as any} size={16} color={typeConfig.color} />
                                    <Text style={[styles.typeText, { color: typeConfig.color }]}>
                                        {typeConfig.label}
                                    </Text>
                                </View>
                            </View>

                            {task.presupuesto && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Presupuesto</Text>
                                    <View style={styles.budgetCard}>
                                        <View style={styles.budgetInfo}>
                                            <Text style={styles.budgetTitle}>{task.presupuesto.name}</Text>
                                            <Text style={styles.budgetAmount}>
                                                {formatCurrency(task.presupuesto.presupuesto)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {task.isCompleted && task.spentAmount > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Gasto registrado</Text>
                                    <Text style={styles.spentAmount}>{formatCurrency(task.spentAmount)}</Text>
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    Colaboradores ({task.users.length})
                                </Text>
                                {task.users.map((user) => (
                                    <View key={user.id} style={styles.userCard}>
                                        <View style={styles.userAvatar}>
                                            <Text style={styles.userAvatarText}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <Text style={styles.userEmail}>{user.email}</Text>
                                        </View>
                                        <View style={styles.roleBadge}>
                                            <Text style={styles.roleText}>{user.role}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    ) : null}

                    <View style={styles.buttonContainer}>
                        {!task?.isCompleted && (
                            <View style={styles.completeSection}>
                                <Text style={styles.completeLabel}>¿Cuánto gastaste?</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0.00"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    keyboardType="decimal-pad"
                                    value={completionAmount}
                                    onChangeText={setCompletionAmount}
                                />
                                <TouchableOpacity
                                    style={[styles.completeButton, completing && { opacity: 0.7 }]}
                                    onPress={handleComplete}
                                    disabled={completing}
                                >
                                    {completing ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <>
                                            <Feather name="check-circle" size={18} color="#FFF" />
                                            <Text style={styles.completeButtonText}>Completar Tarea</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {task?.isCompleted && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Feather name="trash-2" size={16} color="#FFF" />
                                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.closeButton, task?.isCompleted && { flex: 1 }]}
                            onPress={handleClose}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: appTheme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: appTheme.colors.text,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    taskTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: appTheme.colors.text,
        marginBottom: 24,
    },
    descriptionText: {
        fontSize: 15,
        color: appTheme.colors.textSecondary,
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    budgetCard: {
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
    },
    budgetInfo: {
        gap: 4,
    },
    budgetTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    budgetAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: appTheme.colors.primary,
    },
    spentAmount: {
        fontSize: 24,
        fontWeight: '800',
        color: appTheme.colors.error,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: appTheme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: appTheme.colors.textSecondary,
        textTransform: 'capitalize',
    },
    buttonContainer: {
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    completeSection: {
        gap: 12,
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 16,
        padding: 16,
    },
    completeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    amountInput: {
        backgroundColor: appTheme.colors.background,
        borderRadius: 12,
        padding: 14,
        fontSize: 20,
        fontWeight: '700',
        color: appTheme.colors.text,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        textAlign: 'center',
    },
    completeButton: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appTheme.colors.success,
        padding: 16,
        borderRadius: 12,
    },
    completeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    deleteButton: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appTheme.colors.error,
        padding: 16,
        borderRadius: 12,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    closeButton: {
        backgroundColor: appTheme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
