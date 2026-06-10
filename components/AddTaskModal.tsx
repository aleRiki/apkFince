import { appTheme, formatCurrency } from '@/constants/appTheme';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Budget {
    id: number;
    name: string;
    presupuesto: number;
    porcentajeCumplido?: number;
}

interface TaskType {
    id: number;
    name: string;
}

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (task: { title: string; type: string; presupuestoId: number; userIds: number[] }) => void;
}

const PREDEFINED_TYPES = [
    'compras',
    'pagos de servicios',
    'personal',
    'hogar',
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
    visible,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState('');
    const [selectedType, setSelectedType] = useState('compras');
    const [selectedPresupuestoId, setSelectedPresupuestoId] = useState<number | null>(null);
    const [customTypes, setCustomTypes] = useState<TaskType[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loadingBudgets, setLoadingBudgets] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showBudgetPicker, setShowBudgetPicker] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchBudgets();
            fetchCustomTypes();
            if (showUserSearch) {
                fetchUsers();
            }
        }
    }, [visible, showUserSearch]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            setFilteredUsers(users.filter(u =>
                u.name.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const fetchBudgets = async () => {
        setLoadingBudgets(true);
        try {
            const data = await api.get('/api/v1/presupuesto');
            setBudgets(data);
            if (data.length > 0 && !selectedPresupuestoId) {
                setSelectedPresupuestoId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoadingBudgets(false);
        }
    };

    const fetchCustomTypes = async () => {
        try {
            const data = await api.get('/api/v1/task-type');
            setCustomTypes(data);
        } catch (error) {
            console.error('Error fetching task types:', error);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await api.get('/api/v1/users');
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUserIds(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Por favor ingresa un título para la tarea');
            return;
        }
        if (selectedPresupuestoId === null) {
            Alert.alert('Error', 'Por favor selecciona un presupuesto');
            return;
        }

        onSubmit({
            title: title.trim(),
            type: selectedType,
            presupuestoId: selectedPresupuestoId,
            userIds: selectedUserIds
        });

        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setSelectedType('compras');
        setSelectedPresupuestoId(null);
        setSearchQuery('');
        setSelectedUserIds([]);
        setShowUserSearch(false);
        setShowBudgetPicker(false);
        onClose();
    };

    const allTypes = [...PREDEFINED_TYPES, ...customTypes.map(t => t.name)];

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
                        <Text style={styles.title}>Nueva Tarea</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Título</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Ej: Comprar alimentos en el supermercado"
                                placeholderTextColor={appTheme.colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Presupuesto</Text>
                            {loadingBudgets ? (
                                <ActivityIndicator color={appTheme.colors.primary} />
                            ) : (
                                <View>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowBudgetPicker(!showBudgetPicker)}
                                    >
                                        <Feather name="briefcase" size={20} color={appTheme.colors.textSecondary} />
                                        <Text style={styles.dropdownButtonText}>
                                            {selectedPresupuestoId
                                                ? budgets.find(b => b.id === selectedPresupuestoId)?.name || 'Seleccionar'
                                                : 'Seleccionar presupuesto'}
                                        </Text>
                                        <Feather
                                            name={showBudgetPicker ? 'chevron-up' : 'chevron-down'}
                                            size={20}
                                            color={appTheme.colors.textSecondary}
                                        />
                                    </TouchableOpacity>

                                    {showBudgetPicker && (
                                        <View style={styles.dropdownContent}>
                                            {budgets.map((budget) => (
                                                <TouchableOpacity
                                                    key={budget.id}
                                                    style={[
                                                        styles.dropdownItem,
                                                        selectedPresupuestoId === budget.id && styles.selectedDropdownItem,
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedPresupuestoId(budget.id);
                                                        setShowBudgetPicker(false);
                                                    }}
                                                >
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.optionText, selectedPresupuestoId === budget.id && styles.selectedOptionText]}>
                                                            {budget.name}
                                                        </Text>
                                                        <Text style={[styles.optionSubtext, selectedPresupuestoId === budget.id && styles.selectedOptionSubtext]}>
                                                            {(() => {
                                                                const montoGastado = (budget.presupuesto * (budget.porcentajeCumplido || 0)) / 100;
                                                                return `Disp: ${formatCurrency(Math.max(0, budget.presupuesto - montoGastado))} / ${formatCurrency(budget.presupuesto)}`;
                                                            })()}
                                                        </Text>
                                                    </View>
                                                    {selectedPresupuestoId === budget.id && (
                                                        <Feather name="check" size={18} color="#FFF" />
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tipo de tarea</Text>
                            <FlatList
                                data={allTypes}
                                keyExtractor={item => item}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 8 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            selectedType === item && styles.typeButtonActive
                                        ]}
                                        onPress={() => setSelectedType(item)}
                                    >
                                        <Text style={[
                                            styles.typeText,
                                            selectedType === item && styles.typeTextActive
                                        ]}>
                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <TouchableOpacity
                                style={styles.toggleSearchButton}
                                onPress={() => setShowUserSearch(!showUserSearch)}
                            >
                                <Text style={styles.label}>Colaboradores ({selectedUserIds.length})</Text>
                                <Feather name={showUserSearch ? "chevron-up" : "chevron-down"} size={20} color={appTheme.colors.text} />
                            </TouchableOpacity>

                            {showUserSearch && (
                                <View style={styles.userSearchContainer}>
                                    <TextInput
                                        style={[styles.input, { marginBottom: 8 }]}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Buscar usuarios..."
                                        placeholderTextColor={appTheme.colors.textSecondary}
                                    />

                                    {loadingUsers ? (
                                        <ActivityIndicator color={appTheme.colors.primary} />
                                    ) : (
                                        <FlatList
                                            data={filteredUsers}
                                            keyExtractor={item => item.id.toString()}
                                            style={{ maxHeight: 150 }}
                                            nestedScrollEnabled
                                            renderItem={({ item }) => {
                                                const isSelected = selectedUserIds.includes(item.id);
                                                return (
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.userItem,
                                                            isSelected && styles.userItemActive
                                                        ]}
                                                        onPress={() => toggleUserSelection(item.id)}
                                                    >
                                                        <View style={styles.userInfo}>
                                                            <Text style={[styles.userName, isSelected && styles.userTextActive]}>{item.name}</Text>
                                                            <Text style={[styles.userEmail, isSelected && styles.userTextActive]}>{item.email}</Text>
                                                        </View>
                                                        {isSelected && <Feather name="check" size={16} color="#FFF" />}
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Crear Tarea</Text>
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
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: appTheme.colors.text,
    },
    content: {
        paddingHorizontal: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    input: {
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: appTheme.colors.text,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    dropdownButtonText: {
        flex: 1,
        fontSize: 16,
        color: appTheme.colors.text,
    },
    dropdownContent: {
        marginTop: 8,
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.05)',
    },
    selectedDropdownItem: {
        backgroundColor: appTheme.colors.primary,
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
        color: 'rgba(255,255,255,0.8)',
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: appTheme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    typeButtonActive: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.textSecondary,
    },
    typeTextActive: {
        color: '#FFF',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 24,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: appTheme.colors.text,
    },
    submitButton: {
        backgroundColor: appTheme.colors.primary,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    toggleSearchButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    userSearchContainer: {
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    userItemActive: {
        backgroundColor: appTheme.colors.primary,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    userEmail: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
    },
    userTextActive: {
        color: '#FFF',
    }
});
