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
    const [searchQuery, setSearchQuery] = useState('');
    const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);

    // Data for selectors
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingBudgets, setLoadingBudgets] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const icons = ['target', 'umbrella', 'sun', 'home', 'gift', 'award'];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                    <View>
                                        <TouchableOpacity
                                            style={styles.dropdownButton}
                                            onPress={() => setIsBudgetDropdownOpen(!isBudgetDropdownOpen)}
                                        >
                                            <Feather name="briefcase" size={20} color={appTheme.colors.textSecondary} />
                                            <Text style={styles.dropdownButtonText}>
                                                {selectedPresupuestoId
                                                    ? budgets.find(b => b.id === selectedPresupuestoId)?.name
                                                    : 'Seleccionar un presupuesto'}
                                            </Text>
                                            <Feather
                                                name={isBudgetDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                                size={20}
                                                color={appTheme.colors.textSecondary}
                                            />
                                        </TouchableOpacity>

                                        {isBudgetDropdownOpen && (
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
                                                            setIsBudgetDropdownOpen(false);
                                                        }}
                                                    >
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
                                <Text style={styles.label}>Usuarios (Opcional)</Text>
                                <View style={styles.searchContainer}>
                                    <Feather name="search" size={18} color={appTheme.colors.textSecondary} style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar por nombre o email..."
                                        placeholderTextColor={appTheme.colors.textSecondary}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {loadingUsers ? (
                                    <ActivityIndicator color={appTheme.colors.primary} />
                                ) : (
                                    <View style={styles.optionsList}>
                                        {/* Usuarios Seleccionados (siempre visibles) */}
                                        {selectedUserIds.length > 0 && users
                                            .filter(u => selectedUserIds.includes(u.id))
                                            .map((user) => (
                                                <TouchableOpacity
                                                    key={`selected-${user.id}`}
                                                    style={[styles.userCard, styles.selectedUserCard]}
                                                    onPress={() => toggleUserSelection(user.id)}
                                                >
                                                    <View style={[styles.avatar, styles.selectedAvatar]}>
                                                        <Text style={styles.avatarText}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.userInfo}>
                                                        <Text style={[styles.userName, styles.selectedUserName]}>{user.name}</Text>
                                                        <Text style={[styles.userEmail, styles.selectedUserEmail]}>{user.email}</Text>
                                                    </View>
                                                    <View style={styles.selectionIndicator}>
                                                        <Feather name="check-circle" size={20} color="#FFF" />
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        }

                                        {/* Resultados de Búsqueda (solo si hay query) */}
                                        {searchQuery.length > 0 && filteredUsers
                                            .filter(u => !selectedUserIds.includes(u.id))
                                            .map((user) => (
                                                <TouchableOpacity
                                                    key={user.id}
                                                    style={styles.userCard}
                                                    onPress={() => toggleUserSelection(user.id)}
                                                >
                                                    <View style={styles.avatar}>
                                                        <Text style={styles.avatarText}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.userInfo}>
                                                        <Text style={styles.userName}>{user.name}</Text>
                                                        <Text style={styles.userEmail}>{user.email}</Text>
                                                    </View>
                                                    <View style={styles.selectionIndicator}>
                                                        <Feather name="plus-circle" size={20} color={appTheme.colors.textSecondary} />
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        }

                                        {searchQuery.length > 0 && filteredUsers.length === 0 && (
                                            <Text style={styles.infoText}>No se encontraron usuarios</Text>
                                        )}

                                        {searchQuery.length === 0 && selectedUserIds.length === 0 && (
                                            <Text style={styles.infoText}>Comienza a escribir para buscar usuarios...</Text>
                                        )}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        marginBottom: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        color: appTheme.colors.text,
        fontSize: 16,
    },
    infoText: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(148, 163, 184, 0.05)',
        borderRadius: 16,
        padding: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
        marginBottom: 8,
    },
    selectedUserCard: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: appTheme.colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    selectedAvatar: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'transparent',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: appTheme.colors.primary,
    },
    selectedAvatarText: {
        color: '#FFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    selectedUserName: {
        color: '#FFF',
    },
    userEmail: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
    },
    selectedUserEmail: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    selectionIndicator: {
        padding: 4,
    },
});
