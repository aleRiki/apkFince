import { appTheme } from '@/constants/appTheme';
import { useAccounts } from '@/hooks/useAccounts';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
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

interface AddCardModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (cardNumber: string, accountId: number) => Promise<void>;
}

export default function AddCardModal({ visible, onClose, onSubmit }: AddCardModalProps) {
    const [cardNumber, setCardNumber] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAccountPicker, setShowAccountPicker] = useState(false);
    const { accounts } = useAccounts();

    const selectedAccount = accounts.find(acc => acc.id === String(selectedAccountId));

    const handleSubmit = async () => {
        if (!cardNumber || !selectedAccountId) {
            alert('Por favor, completa todos los campos');
            return;
        }

        try {
            setLoading(true);
            await onSubmit(cardNumber, selectedAccountId);
            setCardNumber('');
            setSelectedAccountId(null);
            onClose();
        } catch (error) {
            alert('Error al agregar la tarjeta. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCardNumber('');
        setSelectedAccountId(null);
        setShowAccountPicker(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Agregar Tarjeta</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Número de Tarjeta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: 1234567890"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                keyboardType="numeric"
                                placeholderTextColor={appTheme.colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Cuenta Asociada</Text>
                            <TouchableOpacity
                                style={styles.picker}
                                onPress={() => setShowAccountPicker(!showAccountPicker)}
                            >
                                <Text style={selectedAccount ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                                    {selectedAccount ? selectedAccount.name : 'Selecciona una cuenta'}
                                </Text>
                                <Feather
                                    name={showAccountPicker ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={appTheme.colors.textSecondary}
                                />
                            </TouchableOpacity>

                            {showAccountPicker && (
                                <View style={styles.accountList}>
                                    {accounts.map(account => (
                                        <TouchableOpacity
                                            key={account.id}
                                            style={styles.accountItem}
                                            onPress={() => {
                                                setSelectedAccountId(Number(account.id));
                                                setShowAccountPicker(false);
                                            }}
                                        >
                                            <View>
                                                <Text style={styles.accountName}>{account.name}</Text>
                                                <Text style={styles.accountBank}>{account.bank}</Text>
                                            </View>
                                            {selectedAccountId === Number(account.id) && (
                                                <Feather name="check" size={20} color={appTheme.colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Agregar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: appTheme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.2)',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: appTheme.colors.text,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: appTheme.colors.text,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    picker: {
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    pickerTextPlaceholder: {
        fontSize: 16,
        color: appTheme.colors.textSecondary,
    },
    pickerTextSelected: {
        fontSize: 16,
        color: appTheme.colors.text,
    },
    accountList: {
        marginTop: 8,
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        maxHeight: 200,
    },
    accountItem: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    accountBank: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(148, 163, 184, 0.2)',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: appTheme.colors.backgroundCard,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    submitButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: appTheme.colors.primary,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
