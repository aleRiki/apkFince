import { appTheme } from '@/constants/appTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function LogoutButton() {
    const { logout } = useAuth();

    const handleLogout = () => {
        console.log('Logout button clicked!');
        logout();
        console.log('Navigating to login...');
        router.push('/auth/login');
    };

    return (
        <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
        >
            <Feather name="log-out" size={24} color={appTheme.colors.text} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        padding: 8,
    },
});
