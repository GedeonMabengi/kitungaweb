// src/components/ui/Alert.tsx
import * as React from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

const P = {
    background: '#FFFFFF',
    border: '#E4E4E7',
    fg: '#18181B',
    muted: '#71717A',
    destructiveBg: '#FEF2F2',
    destructiveBorder: '#FECACA',
    destructiveFg: '#991B1B',
    destructiveMuted: '#B91C1C',
};

export type AlertVariant = 'default' | 'destructive';

export type AlertProps = {
    children?: React.ReactNode;
    variant?: AlertVariant;
    style?: StyleProp<ViewStyle>;
};

export function Alert({
    children,
    variant = 'default',
    style,
}: AlertProps) {
    return (
        <View
            style={[
                styles.alert,
                variant === 'destructive' ? styles.destructive : styles.default,
                style,
            ]}
        >
            {children}
        </View>
    );
}

export function AlertTitle({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
}) {
    return <Text style={[styles.title, style]}>{children}</Text>;
}

export function AlertDescription({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
}) {
    return <View style={styles.descriptionWrapper}>{children}</View>;
}

const styles = StyleSheet.create({
    alert: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    default: {
        backgroundColor: P.background,
        borderColor: P.border,
    },
    destructive: {
        backgroundColor: P.destructiveBg,
        borderColor: P.destructiveBorder,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: P.fg,
        flexShrink: 1,
    },
    descriptionWrapper: {
        flex: 1,
        gap: 2,
    },
});