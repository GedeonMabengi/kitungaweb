// src/components/layout/AppLogo.tsx
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AppLogo() {
    return (
        <View style={styles.row}>
            <View style={styles.icon}>
                <Text style={styles.iconText}>K</Text>
            </View>
            <Text style={styles.name}>Kitunga</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    icon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#18181B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        color: '#FAFAFA',
        fontSize: 18,
        fontWeight: '700',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#18181B',
    },
});