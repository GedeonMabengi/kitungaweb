// src/components/forms/InputError.tsx
import * as React from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
} from 'react-native';

const P = {
    error: '#DC2626',
};

export type InputErrorProps = {
    message?: string;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
};

export default function InputError({
    message,
    style,
    numberOfLines,
}: InputErrorProps) {
    if (!message) return null;

    return (
        <Text
            numberOfLines={numberOfLines}
            style={[styles.text, style]}
        >
            {message}
        </Text>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 13,
        color: P.error,
        marginTop: 4,
    },
});