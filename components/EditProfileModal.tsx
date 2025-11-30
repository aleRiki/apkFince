import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    userData: {
        name: string;
        email: string;
        role: string;
    };
    onSave: (data: { name: string; email: string; role: string }) => Promise<boolean>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onClose,
    userData,
    onSave,
}) => {
    const [name, setName] = useState(userData.name);
    const [email, setEmail] = useState(userData.email);
    const [role, setRole] = useState(userData.role);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (visible) {
            setName(userData.name);
            setEmail(userData.email);
            setRole(userData.role);
        }
    }, [visible, userData]);

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Error', 'El nombre y el email son obligatorios');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor ingresa un email válido');
            return;
        }

        setLoading(true);
        try {
            const success = await onSave({
                name: name.trim(),
                email: email.trim(),
                role: role.trim(),
            });

            if (success) {
                Alert.alert('Éxito', 'Perfil actualizado correctamente');
                onClose();
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Perfil</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ingresa tu nombre"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Ingresa tu email"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rol</Text>
                            <TextInput
                                style={styles.input}
                                value={role}
                                onChangeText={setRole}
                                placeholder="Ingresa tu rol"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            )}
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
        backgroundColor: appTheme.colors.backgroundCard,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: appTheme.colors.text,
    },
    form: {
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
        backgroundColor: appTheme.colors.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: appTheme.colors.text,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
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
    saveButton: {
        backgroundColor: appTheme.colors.primary,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
