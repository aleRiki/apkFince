import { appTheme } from '@/constants/appTheme';
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

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (task: { title: string; category: string; userIds: number[] }) => void;
}

const CATEGORIES = [
    { id: 'shopping', label: 'Compras', icon: 'shopping-cart' },
    { id: 'bills', label: 'Pagos/Servicios', icon: 'file-text' },
    { id: 'personal', label: 'Personal', icon: 'user' },
    { id: 'home', label: 'Hogar', icon: 'home' },
    { id: 'other', label: 'Otro', icon: 'more-horizontal' },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
    visible,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('shopping');

    // User search state
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);

    useEffect(() => {
        if (visible && showUserSearch) {
            fetchUsers();
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

        onSubmit({
            title: title.trim(),
            category: selectedCategory,
            userIds: selectedUserIds
        });

        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setSelectedCategory('shopping');
        setSearchQuery('');
        setSelectedUserIds([]);
        setShowUserSearch(false);
        onClose();
    };

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
                            <Text style={styles.label}>Categoría</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryButton,
                                            selectedCategory === cat.id && styles.categoryButtonActive
                                        ]}
                                        onPress={() => setSelectedCategory(cat.id)}
                                    >
                                        <Feather
                                            name={cat.icon as any}
                                            size={20}
                                            color={selectedCategory === cat.id ? '#FFF' : appTheme.colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.categoryText,
                                            selectedCategory === cat.id && styles.categoryTextActive
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: appTheme.colors.backgroundCard,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    categoryButtonActive: {
        backgroundColor: appTheme.colors.primary,
        borderColor: appTheme.colors.primary,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.textSecondary,
    },
    categoryTextActive: {
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
