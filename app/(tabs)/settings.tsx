import { EditProfileModal } from '@/components/EditProfileModal';
import { appTheme } from '@/constants/appTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUser';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const { userData, loading, updateUserData } = useUser();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [biometricsEnabled, setBiometricsEnabled] = React.useState(false);
    const [editModalVisible, setEditModalVisible] = React.useState(false);

    const handleLogout = () => {
        logout();
        router.replace('/auth/login');
    };

    const handleEditProfile = () => {
        setEditModalVisible(true);
    };

    const handleSaveProfile = async (data: { name: string; email: string; role: string }) => {
        return await updateUserData(data);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const SettingItem = ({ icon, title, subtitle, onPress, rightElement }: any) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingIconContainer}>
                <Feather name={icon} size={20} color={appTheme.colors.primary} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement || <Feather name="chevron-right" size={20} color={appTheme.colors.textSecondary} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Configuración</Text>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileCard}>
                    {loading ? (
                        <ActivityIndicator size="large" color={appTheme.colors.primary} />
                    ) : (
                        <>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {userData?.name ? getInitials(userData.name) : 'U'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.userName}>{userData?.name || user?.name || 'Usuario'}</Text>
                                <Text style={styles.userEmail}>{userData?.email || user?.email || 'usuario@email.com'}</Text>
                                {userData?.role && (
                                    <Text style={styles.userRole}>
                                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                                <Feather name="edit-2" size={18} color={appTheme.colors.primary} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* General Settings */}
                <Text style={styles.sectionHeader}>General</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="bell"
                        title="Notificaciones"
                        subtitle="Alertas de gastos y metas"
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#767577', true: appTheme.colors.primary }}
                                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                            />
                        }
                    />
                    <SettingItem
                        icon="shield"
                        title="Seguridad"
                        subtitle="Biometría y contraseña"
                        rightElement={
                            <Switch
                                value={biometricsEnabled}
                                onValueChange={setBiometricsEnabled}
                                trackColor={{ false: '#767577', true: appTheme.colors.primary }}
                                thumbColor={biometricsEnabled ? '#fff' : '#f4f3f4'}
                            />
                        }
                    />
                    <SettingItem
                        icon="globe"
                        title="Idioma"
                        subtitle="Español"
                    />
                </View>

                {/* Support */}
                <Text style={styles.sectionHeader}>Soporte</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="help-circle"
                        title="Ayuda y Soporte"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="info"
                        title="Acerca de"
                        subtitle="Versión 1.0.0"
                        onPress={() => { }}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Feather name="log-out" size={20} color={appTheme.colors.error} />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {userData && (
                <EditProfileModal
                    visible={editModalVisible}
                    onClose={() => setEditModalVisible(false)}
                    userData={{
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                    }}
                    onSave={handleSaveProfile}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: appTheme.colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: appTheme.colors.text,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appTheme.colors.backgroundCard,
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        marginTop: 8,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: appTheme.colors.primary,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: appTheme.colors.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: appTheme.colors.textSecondary,
    },
    userRole: {
        fontSize: 12,
        color: appTheme.colors.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    editButton: {
        padding: 8,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: appTheme.colors.textSecondary,
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        backgroundColor: appTheme.colors.backgroundCard,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: appTheme.colors.text,
    },
    settingSubtitle: {
        fontSize: 13,
        color: appTheme.colors.textSecondary,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: appTheme.colors.error,
    },
});
