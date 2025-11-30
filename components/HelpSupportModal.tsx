import { appTheme } from '@/constants/appTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface HelpSupportModalProps {
    visible: boolean;
    onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
    visible,
    onClose,
}) => {
    const InfoSection = ({ icon, title, content }: { icon: string, title: string, content: string }) => (
        <View style={styles.infoSection}>
            <View style={styles.iconContainer}>
                <Feather name={icon as any} size={24} color={appTheme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{title}</Text>
                <Text style={styles.infoText}>{content}</Text>
            </View>
        </View>
    );

    const TeamMember = ({ name, role }: { name: string, role: string }) => (
        <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>
                <Text style={styles.memberInitials}>{name.split(' ').map(n => n[0]).join('').toUpperCase()}</Text>
            </View>
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{name}</Text>
                <Text style={styles.memberRole}>{role}</Text>
            </View>
        </View>
    );

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
                        <Text style={styles.title}>Ayuda y Soporte</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* App Description */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sobre la Aplicación</Text>
                            <InfoSection
                                icon="heart"
                                title="Orientada a Familias"
                                content="AppEconomic está diseñada específicamente para ayudar a las familias a gestionar sus finanzas de manera eficiente y sencilla. Tome el control de sus ingresos, gastos y presupuestos familiares."
                            />
                            <InfoSection
                                icon="trending-up"
                                title="Gestión Financiera Inteligente"
                                content="Lleve un registro detallado de sus transacciones, visualice sus gastos por categorías, establezca presupuestos y alcance sus metas financieras familiares."
                            />
                            <InfoSection
                                icon="shield"
                                title="Seguridad y Privacidad"
                                content="Sus datos están protegidos con autenticación segura y encriptación. Mantenga la información financiera de su familia completamente privada y segura."
                            />
                        </View>

                        {/* Development Team */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Equipo de Desarrollo</Text>
                            <Text style={styles.sectionSubtitle}>
                                Desarrollado con dedicación por un equipo comprometido con mejorar la gestión financiera familiar
                            </Text>

                            <View style={styles.teamGrid}>
                                <TeamMember name="Alejandro Riki" role="Lead Developer" />
                                <TeamMember name="Ricardo Martinez" role="Backend Developer" />
                                <TeamMember name="Ana García" role="UI/UX Designer" />
                                <TeamMember name="Carlos López" role="QA Engineer" />
                            </View>
                        </View>

                        {/* App Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Información de la Aplicación</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Nombre:</Text>
                                    <Text style={styles.infoValue}>AppEconomic</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Versión:</Text>
                                    <Text style={styles.infoValue}>1.0.0</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Plataforma:</Text>
                                    <Text style={styles.infoValue}>React Native + Expo</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Objetivo:</Text>
                                    <Text style={styles.infoValue}>Gestión Financiera Familiar</Text>
                                </View>
                            </View>
                        </View>

                        {/* Contact */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contacto</Text>
                            <View style={styles.contactCard}>
                                <Feather name="mail" size={20} color={appTheme.colors.primary} />
                                <Text style={styles.contactText}>soporte@appeconomic.com</Text>
                            </View>
                            <View style={styles.contactCard}>
                                <Feather name="globe" size={20} color={appTheme.colors.primary} />
                                <Text style={styles.contactText}>www.appeconomic.com</Text>
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
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
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: appTheme.colors.text,
    },
    content: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: appTheme.colors.text,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    infoSection: {
        flexDirection: 'row',
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
        lineHeight: 20,
    },
    teamGrid: {
        gap: 12,
    },
    teamMember: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberInitials: {
        fontSize: 16,
        fontWeight: '700',
        color: appTheme.colors.primary,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
        marginBottom: 2,
    },
    memberRole: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
    },
    infoCard: {
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: appTheme.colors.text,
        fontWeight: '600',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    contactText: {
        fontSize: 15,
        color: appTheme.colors.text,
        fontWeight: '500',
    },
});
