import { appTheme, formatCurrency } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface Task {
    id: string;
    title: string;
    description: string;
    type: string;
    isCompleted: boolean;
    spentAmount: number;
    presupuesto: {
        id: number;
        name: string;
        presupuesto: number;
    };
    createdAt?: string;
    users: any[];
}

interface TaskItemProps {
    task: Task;
    onToggleComplete: (id: string) => void;
    onShare: (task: Task) => void;
    onPress?: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    'compras': { label: 'Compras', icon: 'shopping-cart', color: '#10B981' },
    'pagos de servicios': { label: 'Pagos/Servicios', icon: 'file-text', color: '#F59E0B' },
    'personal': { label: 'Personal', icon: 'user', color: '#8B5CF6' },
    'hogar': { label: 'Hogar', icon: 'home', color: '#3B82F6' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    onToggleComplete,
    onShare,
    onPress,
}) => {
    const typeConfig = TYPE_CONFIG[task.type?.toLowerCase()] || { label: task.type || 'Otro', icon: 'more-horizontal', color: '#6B7280' };

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `📋 Tarea: ${task.title}\n📁 Tipo: ${typeConfig.label}\n💰 Presupuesto: ${task.presupuesto?.name || 'N/A'}\n${task.isCompleted ? '✅ Completada' : '⏳ Pendiente'}`,
                title: 'Compartir Tarea',
            });

            if (result.action === Share.sharedAction) {
                onShare(task);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo compartir la tarea');
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, task.isCompleted && styles.containerCompleted]}
            onPress={() => onPress?.(task.id)}
            activeOpacity={0.7}
        >
            <TouchableOpacity
                style={styles.checkbox}
                onPress={(e) => {
                    e.stopPropagation();
                    if (!task.isCompleted) {
                        onToggleComplete(task.id);
                    }
                }}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.checkboxInner,
                    task.isCompleted && styles.checkboxChecked
                ]}>
                    {task.isCompleted && (
                        <Feather name="check" size={16} color="#FFF" />
                    )}
                </View>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[
                        styles.title,
                        task.isCompleted && styles.titleCompleted
                    ]} numberOfLines={2}>
                        {task.title}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
                        <Feather name={typeConfig.icon as any} size={12} color={typeConfig.color} />
                        <Text style={[styles.typeText, { color: typeConfig.color }]}>
                            {typeConfig.label}
                        </Text>
                    </View>

                    {task.presupuesto && (
                        <View style={styles.budgetBadge}>
                            <Feather name="briefcase" size={12} color={appTheme.colors.primary} />
                            <Text style={styles.budgetText}>{task.presupuesto.name}</Text>
                        </View>
                    )}

                    {task.isCompleted && task.spentAmount > 0 && (
                        <View style={styles.spentBadge}>
                            <Text style={styles.spentText}>{formatCurrency(task.spentAmount)}</Text>
                        </View>
                    )}

                    {task.users && task.users.length > 1 && (
                        <View style={styles.collaboratorBadge}>
                            <Feather name="users" size={12} color={appTheme.colors.primary} />
                            <Text style={styles.collaboratorCount}>{task.users.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            {!task.isCompleted && (
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleShare();
                    }}
                    activeOpacity={0.7}
                >
                    <Feather name="share-2" size={18} color={appTheme.colors.primary} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    containerCompleted: {
        opacity: 0.7,
    },
    checkbox: {
        padding: 4,
    },
    checkboxInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: appTheme.colors.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: appTheme.colors.success,
        borderColor: appTheme.colors.success,
    },
    content: {
        flex: 1,
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
        flex: 1,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: appTheme.colors.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    budgetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
    },
    budgetText: {
        fontSize: 11,
        fontWeight: '600',
        color: appTheme.colors.primary,
    },
    spentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    spentText: {
        fontSize: 11,
        fontWeight: '700',
        color: appTheme.colors.error,
    },
    shareButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
    },
    collaboratorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
    },
    collaboratorCount: {
        fontSize: 12,
        fontWeight: '600',
        color: appTheme.colors.primary,
    },
});
