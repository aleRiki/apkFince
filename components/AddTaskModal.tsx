import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (task: { title: string; category: string }) => void;
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

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Por favor ingresa un título para la tarea');
            return;
        }

        onSubmit({
            title: title.trim(),
            category: selectedCategory,
        });

        // Reset form
        setTitle('');
        setSelectedCategory('shopping');
        onClose();
    };

    const handleClose = () => {
        setTitle('');
        setSelectedCategory('shopping');
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
        maxHeight: '80%',
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
});
