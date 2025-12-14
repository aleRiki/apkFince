import { appTheme } from '@/constants/appTheme';
import { useCards } from '@/hooks/useCards';
import { api } from '@/services/api';
import { BudgetCreateData } from '@/types/budget';
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

interface AddBudgetModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (budgetData: BudgetCreateData) => void;
}

export default function AddBudgetModal({ visible, onClose, onSubmit }: AddBudgetModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    const { cards, loading: cardsLoading, refetch: fetchCards } = useCards();

    // User search state
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data } = await api.get('/api/v1/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setName('');
            setDescription('');
            setAmount('');
            setSelectedCardId(null);
            setSelectedUserIds([]);
            setSearchQuery('');
            setFilteredUsers([]);
            fetchCards();
            fetchUsers();
        }
    }, [visible]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers([]);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = users.filter((user: User) =>
                user.name.toLowerCase().includes(lowerQuery) ||
                user.email.toLowerCase().includes(lowerQuery)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const handleSubmit = () => {
        const presupuesto = parseFloat(amount);

        if (!name.trim()) {
            alert('Por favor ingresa un nombre para el presupuesto');
            return;
        }
        if (!description.trim()) {
            alert('Por favor ingresa una descripción');
            return;
        }
        if (isNaN(presupuesto) || presupuesto <= 0) {
            alert('Por favor ingresa un monto válido');
            return;
        }
        if (selectedCardId === null) {
            alert('Por favor selecciona una tarjeta');
            return;
        }

        const budgetData: BudgetCreateData = {
            name,
            description,
            presupuesto,
            cardId: selectedCardId,
        };

        // Only add userIds if there are selected users
        if (selectedUserIds.length > 0) {
            budgetData.userIds = selectedUserIds;
        }

        onSubmit(budgetData);
        onClose();
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
        // Clear search after selection to allow searching for another
        setSearchQuery('');
    };

    const removeUser = (userId: number) => {
        setSelectedUserIds(prev => prev.filter(id => id !== userId));
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
                        <Text style={styles.title}>Nuevo Presupuesto</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nombre del presupuesto</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Presupuesto Proyectos IT"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Descripción del presupuesto"
                                    placeholderTextColor={appTheme.colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

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
                                <Text style={styles.label}>Tarjeta</Text>
                                {cardsLoading ? (
                                    <ActivityIndicator color={appTheme.colors.primary} />
                                ) : (
                                    <View style={styles.optionsList}>
                                        {cards.map((card) => (
                                            <TouchableOpacity
                                                key={card.id}
                                                style={[
                                                    styles.optionItem,
                                                    selectedCardId === parseInt(card.id) && styles.selectedOption,
                                                ]}
                                                onPress={() => setSelectedCardId(parseInt(card.id))}
                                            >
                                                <Feather
                                                    name="credit-card"
                                                    size={20}
                                                    color={selectedCardId === parseInt(card.id) ? '#FFF' : appTheme.colors.textSecondary}
                                                />
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        selectedCardId === parseInt(card.id) && styles.selectedOptionText,
                                                    ]}
                                                >
                                                    {card.number} - {card.account.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Usuarios (Opcional)</Text>
                                <Text style={styles.helperText}>
                                    Si no seleccionas usuarios, el presupuesto será solo para ti.
                                </Text>

                                {/* Selected Users Chips */}
                                {selectedUserIds.length > 0 && (
                                    <View style={styles.selectedUsersContainer}>
                                        {users.filter(u => selectedUserIds.includes(u.id)).map(user => (
                                            <View key={user.id} style={styles.userChip}>
                                                <Text style={styles.userChipText}>{user.name}</Text>
                                                <TouchableOpacity onPress={() => removeUser(user.id)}>
                                                    <Feather name="x" size={14} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Search Input */}
                                <View style={styles.searchContainer}>
                                    <Feather name="search" size={20} color={appTheme.colors.textSecondary} style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar usuarios por nombre o correo..."
                                        placeholderTextColor={appTheme.colors.textSecondary}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {/* Search Results */}
                                {searchQuery !== '' && (
                                    <View style={styles.searchResults}>
                                        {loadingUsers ? (
                                            <ActivityIndicator color={appTheme.colors.primary} />
                                        ) : filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <TouchableOpacity
                                                    key={user.id}
                                                    style={styles.userResultItem}
                                                    onPress={() => toggleUserSelection(user.id)}
                                                    disabled={selectedUserIds.includes(user.id)}
                                                >
                                                    <View style={[styles.userAvatar, { backgroundColor: appTheme.colors.primary }]}>
                                                        <Text style={styles.userAvatarText}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.userName}>{user.name}</Text>
                                                        <Text style={styles.userEmail}>{user.email}</Text>
                                                    </View>
                                                    {selectedUserIds.includes(user.id) && (
                                                        <Feather name="check" size={18} color={appTheme.colors.success} style={{ marginLeft: 'auto' }} />
                                                    )}
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={styles.noResultsText}>No se encontraron usuarios</Text>
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
                        <Text style={styles.submitButtonText}>Crear Presupuesto</Text>
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
    helperText: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    selectedUsersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    userChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.primary,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    userChipText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        color: appTheme.colors.text,
        fontSize: 16,
    },
    searchResults: {
        marginTop: 8,
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        maxHeight: 200,
    },
    userResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.1)',
        gap: 12,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    userName: {
        color: appTheme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    userEmail: {
        color: appTheme.colors.textSecondary,
        fontSize: 12,
    },
    noResultsText: {
        padding: 16,
        textAlign: 'center',
        color: appTheme.colors.textSecondary,
        fontStyle: 'italic',
    },
});
