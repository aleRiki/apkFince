import { appTheme } from '@/constants/appTheme';
import { useCards } from '@/hooks/useCards';
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

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (transactionType: 'deposit' | 'withdrawal', amount: number, description: string, cardId: number) => Promise<void>;
}

export default function AddTransactionModal({ visible, onClose, onSubmit }: AddTransactionModalProps) {
    const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCardPicker, setShowCardPicker] = useState(false);
    const { cards } = useCards();

    const selectedCard = cards.find(card => card.id === selectedCardId);

    const handleSubmit = async () => {
        if (!amount || !description || !selectedCardId) {
            alert('Por favor, completa todos los campos');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Por favor, ingresa un monto válido');
            return;
        }

        try {
            setLoading(true);
            const cardIdNum = parseInt(selectedCardId, 10);
            await onSubmit(transactionType, amountNum, description, cardIdNum);
            setAmount('');
            setDescription('');
            setSelectedCardId(null);
            setTransactionType('deposit');
            onClose();
        } catch (error) {
            alert('Error al crear la transacción. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setDescription('');
        setSelectedCardId(null);
        setTransactionType('deposit');
        setShowCardPicker(false);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nueva Transacción</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tipo de Transacción</Text>
                            <View style={styles.typeButtons}>
                                <TouchableOpacity
                                    style={[styles.typeButton, transactionType === 'deposit' && styles.typeButtonActive]}
                                    onPress={() => setTransactionType('deposit')}
                                >
                                    <Feather name="arrow-down-circle" size={20} color={transactionType === 'deposit' ? '#FFF' : appTheme.colors.success} />
                                    <Text style={[styles.typeButtonText, transactionType === 'deposit' && styles.typeButtonTextActive]}>Ingreso</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, transactionType === 'withdrawal' && styles.typeButtonActive]}
                                    onPress={() => setTransactionType('withdrawal')}
                                >
                                    <Feather name="arrow-up-circle" size={20} color={transactionType === 'withdrawal' ? '#FFF' : appTheme.colors.error} />
                                    <Text style={[styles.typeButtonText, transactionType === 'withdrawal' && styles.typeButtonTextActive]}>Gasto</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Monto</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                placeholderTextColor={appTheme.colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Compra de supermercado"
                                value={description}
                                onChangeText={setDescription}
                                placeholderTextColor={appTheme.colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tarjeta</Text>
                            <TouchableOpacity style={styles.picker} onPress={() => setShowCardPicker(!showCardPicker)}>
                                <Text style={selectedCard ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                                    {selectedCard ? `•••• ${selectedCard.number.slice(-4)} - ${selectedCard.account.name}` : 'Selecciona una tarjeta'}
                                </Text>
                                <Feather name={showCardPicker ? "chevron-up" : "chevron-down"} size={20} color={appTheme.colors.textSecondary} />
                            </TouchableOpacity>

                            {showCardPicker && (
                                <View style={styles.cardList}>
                                    {cards.map(card => (
                                        <TouchableOpacity
                                            key={card.id}
                                            style={styles.cardItem}
                                            onPress={() => {
                                                setSelectedCardId(card.id);
                                                setShowCardPicker(false);
                                            }}
                                        >
                                            <View>
                                                <Text style={styles.cardNumber}>•••• {card.number.slice(-4)}</Text>
                                                <Text style={styles.cardAccount}>{card.account.name}</Text>
                                            </View>
                                            {selectedCardId === card.id && <Feather name="check" size={20} color={appTheme.colors.primary} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Crear Transacción</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    container: { backgroundColor: appTheme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(148, 163, 184, 0.2)' },
    title: { fontSize: 20, fontWeight: '700', color: appTheme.colors.text },
    closeButton: { padding: 4 },
    content: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: appTheme.colors.text, marginBottom: 8 },
    typeButtons: { flexDirection: 'row', gap: 12 },
    typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, backgroundColor: appTheme.colors.backgroundCard, borderWidth: 2, borderColor: 'transparent' },
    typeButtonActive: { backgroundColor: appTheme.colors.primary, borderColor: appTheme.colors.primary },
    typeButtonText: { fontSize: 14, fontWeight: '600', color: appTheme.colors.text },
    typeButtonTextActive: { color: '#FFF' },
    input: { backgroundColor: appTheme.colors.backgroundCard, borderRadius: 12, padding: 16, fontSize: 16, color: appTheme.colors.text, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
    picker: { backgroundColor: appTheme.colors.backgroundCard, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
    pickerTextPlaceholder: { fontSize: 16, color: appTheme.colors.textSecondary },
    pickerTextSelected: { fontSize: 16, color: appTheme.colors.text },
    cardList: { marginTop: 8, backgroundColor: appTheme.colors.backgroundCard, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)', maxHeight: 200 },
    cardItem: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(148, 163, 184, 0.1)' },
    cardNumber: { fontSize: 16, fontWeight: '600', color: appTheme.colors.text },
    cardAccount: { fontSize: 13, color: appTheme.colors.textSecondary, marginTop: 2 },
    footer: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(148, 163, 184, 0.2)' },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: appTheme.colors.backgroundCard, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: appTheme.colors.text },
    submitButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: appTheme.colors.primary, alignItems: 'center' },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
