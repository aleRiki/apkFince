import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface GoalModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (goalData: { name: string; targetAmount: number; icon: string }) => void;
    initialData?: { name: string; targetAmount: number; icon: string } | null;
}

export default function GoalModal({ visible, onClose, onSubmit, initialData }: GoalModalProps) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('target');

    const icons = ['target', 'umbrella', 'sun', 'home', 'gift', 'award'];

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setAmount(initialData.targetAmount.toString());
                setSelectedIcon(initialData.icon);
            } else {
                setName('');
                setAmount('');
                setSelectedIcon('target');
            }
        }
    }, [visible, initialData]);

    const handleSubmit = () => {
        const targetAmount = parseFloat(amount);
        if (name && !isNaN(targetAmount) && targetAmount > 0) {
            onSubmit({ name, targetAmount, icon: selectedIcon });
            onClose();
        } else {
            alert('Por favor completa todos los campos correctamente');
        }
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
                        <Text style={styles.title}>{initialData ? 'Editar Meta' : 'Nueva Meta'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre de la meta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej. Vacaciones"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Monto objetivo (€)</Text>
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
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Guardar Meta</Text>
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
