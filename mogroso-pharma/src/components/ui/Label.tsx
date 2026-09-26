// src/components/ui/Label.tsx
import * as React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

export type LabelProps = {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
    disabled?: boolean;
    /** Associe visuellement à un Input en dessous (marge) */
    htmlFor?: string;
    testID?: string;
};

export function Label({
    children,
    style,
    disabled = false,
    testID,
}: LabelProps) {
    return (
        <Text
            testID={testID}
            selectable={false}
            style={[
                styles.label,
                disabled && styles.labelDisabled,
                style,
            ]}
        >
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        lineHeight: 16,
        fontWeight: '500',
        color: '#18181B',
    },
    labelDisabled: {
        opacity: 0.5,
    },
});