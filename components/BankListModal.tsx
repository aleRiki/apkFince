import { appTheme } from '@/constants/appTheme';
import { useBanks } from '@/hooks/useBanks';
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

interface BankListModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectBank?: (bank: any) => void; // Optional if just for management
}

export default function BankListModal({
    visible,
    onClose,
    onSelectBank,
}: BankListModalProps) {
    const { banks, loading, addBank } = useBanks();
    const [isAdding, setIsAdding] = useState(false);
    const [newBankName, setNewBankName] = useState('');
    const [newBankAddress, setNewBankAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAddBank = async () => {
        if (!newBankName.trim() || !newBankAddress.trim()) {
            alert('Por favor completa todos los campos');
            return;
        }

        try {
            setSubmitting(true);
            await addBank({
                name: newBankName,
                address: newBankAddress,
            });
            setNewBankName('');
            setNewBankAddress('');
            setIsAdding(false);
            alert('Banco agregado exitosamente');
        } catch (error) {
            alert('Error al agregar el banco');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Bancos Disponibles</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={appTheme.colors.primary} />
                    ) : (
                        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                            {banks.map((bank) => (
                                <TouchableOpacity
                                    key={bank.id}
                                    style={styles.bankItem}
                                    onPress={() => {
                                        if (onSelectBank) {
                                            onSelectBank(bank);
                                            onClose();
                                        }
                                    }}
                                    disabled={!onSelectBank}
                                >
                                    <View style={styles.bankIcon}>
                                        <Feather name="briefcase" size={20} color={appTheme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.bankName}>{bank.name}</Text>
                                        <Text style={styles.bankAddress}>{bank.address}</Text>
                                    </View>
                                    {onSelectBank && (
                                        <Feather
                                            name="chevron-right"
                                            size={20}
                                            color={appTheme.colors.textSecondary}
                                            style={{ marginLeft: 'auto' }}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}

                            {banks.length === 0 && (
                                <Text style={styles.emptyText}>No hay bancos registrados</Text>
                            )}
                        </ScrollView>
                    )}

                    {isAdding ? (
                        <View style={styles.addForm}>
                            <Text style={styles.addTitle}>Nuevo Banco</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre del Banco"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                value={newBankName}
                                onChangeText={setNewBankName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección"
                                placeholderTextColor={appTheme.colors.textSecondary}
                                value={newBankAddress}
                                onChangeText={setNewBankAddress}
                            />
                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setIsAdding(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.submitButton]}
                                    onPress={handleAddBank}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Guardar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setIsAdding(true)}
                        >
                            <Feather name="plus" size={20} color="#FFF" />
                            <Text style={styles.addButtonText}>Agregar Nuevo Banco</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: appTheme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '90%',
        minHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: appTheme.colors.text,
    },
    list: {
        flex: 1,
        marginBottom: 20,
    },
    bankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    bankIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    bankName: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    bankAddress: {
        fontSize: 12,
        color: appTheme.colors.textSecondary,
    },
    emptyText: {
        textAlign: 'center',
        color: appTheme.colors.textSecondary,
        marginTop: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appTheme.colors.primary,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    addForm: {
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 16,
    },
    addTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
        marginBottom: 12,
    },
    input: {
        backgroundColor: appTheme.colors.background,
        borderRadius: 8,
        padding: 12,
        color: appTheme.colors.text,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: appTheme.colors.textSecondary,
    },
    cancelButtonText: {
        color: appTheme.colors.textSecondary,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: appTheme.colors.primary,
    },
    submitButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});
