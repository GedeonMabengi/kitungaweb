// src/screens/_Placeholder.tsx
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

export function Placeholder({
    title,
    description,
}: {
    title?: string;
    description?: string;
}) {
    const route = useRoute();
    const finalTitle = title ?? route.name;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{finalTitle}</Text>
            <Text style={styles.subtitle}>
                {description ?? 'Écran en construction'}
            </Text>
            <View style={styles.card}>
                <Text style={styles.cardLabel}>Route :</Text>
                <Text style={styles.cardValue}>{route.name}</Text>
                <Text style={[styles.cardLabel, { marginTop: 12 }]}>Params :</Text>
                <Text style={styles.cardValue}>
                    {JSON.stringify(route.params ?? {}, null, 2)}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        gap: 12,
        backgroundColor: '#FAFAFA',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#18181B',
    },
    subtitle: {
        fontSize: 14,
        color: '#71717A',
    },
    card: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E4E4E7',
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#71717A',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardValue: {
        fontSize: 14,
        color: '#18181B',
        marginTop: 4,
        fontFamily: 'monospace',
    },
});