import { appTheme } from '@/constants/appTheme';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TaskUser {
    id: number;
    name: string;
    email: string;
    role: string;
    deletedAt: string | null;
}

interface TaskDetail {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    users: TaskUser[];
}

interface TaskDetailModalProps {
    visible: boolean;
    taskId: string | null;
    onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    shopping: { label: 'Compras', icon: 'shopping-cart', color: '#10B981' },
    bills: { label: 'Pagos/Servicios', icon: 'file-text', color: '#F59E0B' },
    personal: { label: 'Personal', icon: 'user', color: '#8B5CF6' },
    home: { label: 'Hogar', icon: 'home', color: '#3B82F6' },
    other: { label: 'Otro', icon: 'more-horizontal', color: '#6B7280' },
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    visible,
    taskId,
    onClose,
}) => {
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && taskId) {
            fetchTaskDetail();
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

    const handleClose = () => {
        setTask(null);
        onClose();
    };

    const categoryConfig = task ? (CATEGORY_CONFIG[task.description] || CATEGORY_CONFIG.other) : CATEGORY_CONFIG.other;

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
                            {/* Status Badge */}
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

                            {/* Task Title */}
                            <Text style={styles.taskTitle}>{task.title}</Text>

                            {/* Category */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Categoría</Text>
                                <View style={[styles.categoryBadge, { backgroundColor: `${categoryConfig.color}20` }]}>
                                    <Feather name={categoryConfig.icon as any} size={16} color={categoryConfig.color} />
                                    <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                                        {categoryConfig.label}
                                    </Text>
                                </View>
                            </View>

                            {/* Collaborators */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    Colaboradores ({task.users.length})
                                </Text>
                                {task.users.length === 0 ? (
                                    <Text style={styles.emptyText}>No hay colaboradores asignados</Text>
                                ) : (
                                    task.users.map((user) => (
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
                                    ))
                                )}
                            </View>
                        </ScrollView>
                    ) : null}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
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
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
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
    emptyText: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
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
