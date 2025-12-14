import { appTheme } from '@/constants/appTheme';
import { api } from '@/services/api';
import { GoalCreateData } from '@/types/goal';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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

interface User {
    id: number;
    name: string;
    email: string;
}

interface Budget {
    id: number;
    name: string;
    description: string;
}

interface GoalModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (goalData: GoalCreateData) => void;
}

export default function GoalModal({ visible, onClose, onSubmit }: GoalModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('target');
    const [selectedPresupuestoId, setSelectedPresupuestoId] = useState<number | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    // Data for selectors
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingBudgets, setLoadingBudgets] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const icons = ['target', 'umbrella', 'sun', 'home', 'gift', 'award'];

    useEffect(() => {
        if (visible) {
            setName('');
            setDescription('');
            setSelectedIcon('target');
            setSelectedPresupuestoId(null);
            setSelectedUserIds([]);
            fetchBudgets();
            fetchUsers();
        }
    }, [visible]);

    const fetchBudgets = async () => {
        setLoadingBudgets(true);
        try {
            const data = await api.get('/api/v1/presupuesto');
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoadingBudgets(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await api.get('/api/v1/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('Por favor ingresa un nombre para la meta');
            return;
        }
        if (!description.trim()) {
            alert('Por favor ingresa una descripción');
            return;
        }
        if (selectedPresupuestoId === null) {
            alert('Por favor selecciona un presupuesto');
            return;
        }
        if (selectedUserIds.length === 0) {
            alert('Por favor selecciona al menos un usuario');
            return;
        }

        onSubmit({
            name,
            description,
            presupuestoId: selectedPresupuestoId,
            userIds: selectedUserIds,
        });
        onClose();
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
                        <Text style={styles.title}>Nueva Meta</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nombre de la meta</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Meta Marketing"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Descripción de la meta"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Icono</Text>
                                <View style={styles.iconSelector}>
                                    {icons.map((icon) => (
                                        <TouchableOpacity
                                            key={icon}
                                            style={[
                                                styles.iconOption,
                                                selectedIcon === icon && styles.selectedIconOption,
                                            ]}
                                            onPress={() => setSelectedIcon(icon)}
                                        >
                                            <Feather
                                                name={icon as any}
                                                size={24}
                                                color={selectedIcon === icon ? '#FFF' : appTheme.colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Presupuesto asociado</Text>
                                {loadingBudgets ? (
                                    <ActivityIndicator color={appTheme.colors.primary} />
                                ) : (
                                    <View style={styles.optionsList}>
                                        {budgets.map((budget) => (
                                            <TouchableOpacity
                                                key={budget.id}
                                                style={[
                                                    styles.optionItem,
                                                    selectedPresupuestoId === budget.id && styles.selectedOption,
                                                ]}
                                                onPress={() => setSelectedPresupuestoId(budget.id)}
                                            >
                                                <Feather
                                                    name="briefcase"
                                                    size={20}
                                                    color={selectedPresupuestoId === budget.id ? '#FFF' : appTheme.colors.textSecondary}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={[
                                                            styles.optionText,
                                                            selectedPresupuestoId === budget.id && styles.selectedOptionText,
                                                        ]}
                                                    >
                                                        {budget.name}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.optionSubtext,
                                                            selectedPresupuestoId === budget.id && styles.selectedOptionSubtext,
                                                        ]}
                                                    >
                                                        {budget.description}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Usuarios</Text>
                                {loadingUsers ? (
                                    <ActivityIndicator color={appTheme.colors.primary} />
                                ) : (
                                    <View style={styles.optionsList}>
                                        {users.map((user) => (
                                            <TouchableOpacity
                                                key={user.id}
                                                style={[
                                                    styles.optionItem,
                                                    selectedUserIds.includes(user.id) && styles.selectedOption,
                                                ]}
                                                onPress={() => toggleUserSelection(user.id)}
                                            >
                                                <Feather
                                                    name={selectedUserIds.includes(user.id) ? 'check-square' : 'square'}
                                                    size={20}
                                                    color={selectedUserIds.includes(user.id) ? '#FFF' : appTheme.colors.textSecondary}
                                                />
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        selectedUserIds.includes(user.id) && styles.selectedOptionText,
                                                    ]}
                                                >
                                                    {user.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Crear Meta</Text>
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
        gap: 16,
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
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    iconSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: appTheme.colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    selectedIconOption: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    optionsList: {
        gap: 8,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    selectedOption: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    optionText: {
        fontSize: 16,
        color: appTheme.colors.text,
        flex: 1,
    },
    selectedOptionText: {
        color: '#FFF',
        fontWeight: '600',
    },
    optionSubtext: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
        marginTop: 2,
    },
    selectedOptionSubtext: {
        color: 'rgba(255, 255, 255, 0.8)',
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
