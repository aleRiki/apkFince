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

interface AboutModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
    visible,
    onClose,
}) => {
    const VersionCard = ({ version, date, changes }: { version: string, date: string, changes: string[] }) => (
        <View style={styles.versionCard}>
            <View style={styles.versionHeader}>
                <View>
                    <Text style={styles.versionNumber}>Versión {version}</Text>
                    <Text style={styles.versionDate}>{date}</Text>
                </View>
                <View style={styles.versionBadge}>
                    <Text style={styles.badgeText}>{version === '1.0.0' ? 'ACTUAL' : 'ANTERIOR'}</Text>
                </View>
            </View>
            <View style={styles.changesList}>
                {changes.map((change, index) => (
                    <View key={index} style={styles.changeItem}>
                        <Feather name="check-circle" size={16} color={appTheme.colors.primary} />
                        <Text style={styles.changeText}>{change}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
        <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
                <Feather name={icon as any} size={20} color={appTheme.colors.primary} />
            </View>
            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
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
                        <Text style={styles.title}>Acerca de</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={appTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* App Logo/Name */}
                        <View style={styles.appHeader}>
                            <View style={styles.appIcon}>
                                <Feather name="dollar-sign" size={40} color={appTheme.colors.primary} />
                            </View>
                            <Text style={styles.appName}>AppEconomic</Text>
                            <Text style={styles.appTagline}>Gestión Financiera para Familias</Text>
                        </View>

                        {/* Current Features */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Funcionalidades Actuales</Text>
                            <FeatureCard
                                icon="home"
                                title="Dashboard Intuitivo"
                                description="Visualiza el resumen de tus finanzas de un vistazo con gráficos y estadísticas"
                            />
                            <FeatureCard
                                icon="credit-card"
                                title="Gestión de Tarjetas"
                                description="Administra múltiples tarjetas bancarias y cuentas en un solo lugar"
                            />
                            <FeatureCard
                                icon="trending-up"
                                title="Seguimiento de Transacciones"
                                description="Registra y categoriza todos tus ingresos y gastos fácilmente"
                            />
                            <FeatureCard
                                icon="pie-chart"
                                title="Presupuestos Personalizados"
                                description="Crea y monitorea presupuestos para diferentes categorías de gastos"
                            />
                            <FeatureCard
                                icon="user"
                                title="Gestión de Perfil"
                                description="Personaliza tu información y preferencias desde la configuración"
                            />
                            <FeatureCard
                                icon="lock"
                                title="Autenticación Segura"
                                description="Tus datos protegidos con autenticación JWT y encriptación"
                            />
                        </View>

                        {/* Version History */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Historial de Versiones</Text>

                            <VersionCard
                                version="1.0.0"
                                date="30 de Noviembre, 2024"
                                changes={[
                                    'Lanzamiento inicial de AppEconomic',
                                    'Sistema de autenticación completo (Login/Registro)',
                                    'Dashboard con resumen financiero en tiempo real',
                                    'Gestión completa de tarjetas bancarias',
                                    'Registro y visualización de transacciones',
                                    'Sistema de presupuestos por categorías',
                                    'Pantalla de configuración y gestión de perfil',
                                    'Edición de información del usuario',
                                    'Integración completa con backend REST API',
                                    'Diseño responsive y optimizado para móviles',
                                ]}
                            />

                            <VersionCard
                                version="0.9.0"
                                date="25 de Noviembre, 2024"
                                changes={[
                                    'Beta testing con usuarios seleccionados',
                                    'Implementación del sistema de transacciones',
                                    'Optimización del rendimiento de la aplicación',
                                    'Corrección de bugs reportados',
                                ]}
                            />

                            <VersionCard
                                version="0.5.0"
                                date="15 de Noviembre, 2024"
                                changes={[
                                    'Prototipo funcional inicial',
                                    'Diseño de la interfaz de usuario',
                                    'Configuración del backend básico',
                                    'Pruebas de concepto',
                                ]}
                            />
                        </View>

                        {/* Technical Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Información Técnica</Text>
                            <View style={styles.techCard}>
                                <View style={styles.techRow}>
                                    <Feather name="smartphone" size={18} color={appTheme.colors.primary} />
                                    <View style={styles.techInfo}>
                                        <Text style={styles.techLabel}>Plataforma</Text>
                                        <Text style={styles.techValue}>React Native + Expo</Text>
                                    </View>
                                </View>
                                <View style={styles.techRow}>
                                    <Feather name="server" size={18} color={appTheme.colors.primary} />
                                    <View style={styles.techInfo}>
                                        <Text style={styles.techLabel}>Backend</Text>
                                        <Text style={styles.techValue}>Node.js + NestJS</Text>
                                    </View>
                                </View>
                                <View style={styles.techRow}>
                                    <Feather name="database" size={18} color={appTheme.colors.primary} />
                                    <View style={styles.techInfo}>
                                        <Text style={styles.techLabel}>Base de Datos</Text>
                                        <Text style={styles.techValue}>PostgreSQL</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Copyright */}
                        <View style={styles.footer}>
                            <Text style={styles.copyright}>© 2024 AppEconomic</Text>
                            <Text style={styles.copyrightText}>
                                Todos los derechos reservados
                            </Text>
                            <Text style={styles.copyrightText}>
                                Hecho con ❤️ para familias
                            </Text>
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
    appHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 16,
    },
    appIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        color: appTheme.colors.text,
        marginBottom: 4,
    },
    appTagline: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: appTheme.colors.text,
        marginBottom: 16,
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: appTheme.colors.text,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        lineHeight: 18,
    },
    versionCard: {
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    versionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    versionNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: appTheme.colors.text,
    },
    versionDate: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        marginTop: 2,
    },
    versionBadge: {
        backgroundColor: appTheme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    changesList: {
        gap: 8,
    },
    changeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    changeText: {
        flex: 1,
        fontSize: 14,
        color: appTheme.colors.text,
        lineHeight: 20,
    },
    techCard: {
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    techRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    techInfo: {
        flex: 1,
    },
    techLabel: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        marginBottom: 2,
    },
    techValue: {
        fontSize: 15,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(148, 163, 184, 0.1)',
        marginTop: 16,
    },
    copyright: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.text,
        marginBottom: 4,
    },
    copyrightText: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        marginTop: 2,
    },
});
