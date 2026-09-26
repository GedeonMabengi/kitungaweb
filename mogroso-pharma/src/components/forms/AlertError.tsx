// src/components/forms/AlertError.tsx
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';

const P = {
    destructiveFg: '#991B1B',
};

export type AlertErrorProps = {
    errors: string[];
    title?: string;
};

export default function AlertError({
    errors,
    title,
}: AlertErrorProps) {
    if (!errors || errors.length === 0) return null;

    // Déduplication
    const uniqueErrors = Array.from(new Set(errors));

    return (
        <Alert variant="destructive">
            <AlertCircle size={18} color={P.destructiveFg} style={styles.icon} />
            <View style={styles.content}>
                <AlertTitle style={styles.title}>
                    {title || 'Une erreur est survenue.'}
                </AlertTitle>
                <AlertDescription>
                    {uniqueErrors.map((error, index) => (
                        <View key={index} style={styles.item}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ))}
                </AlertDescription>
            </View>
        </Alert>
    );
}

const styles = StyleSheet.create({
    icon: {
        marginTop: 1,
    },
    content: {
        flex: 1,
        gap: 6,
    },
    title: {
        color: P.destructiveFg,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
    },
    bullet: {
        fontSize: 13,
        color: P.destructiveFg,
        lineHeight: 18,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: P.destructiveFg,
        lineHeight: 18,
    },
});