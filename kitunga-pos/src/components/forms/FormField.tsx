// src/components/forms/FormField.tsx
import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Label } from '../ui/Label';
import InputError from './InputError';

export type FormFieldProps = {
    label?: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function FormField({ label, error, hint, children, style }: FormFieldProps) {
    return (
        <View style={[styles.wrapper, style]}>
            {label ? <Label>{label}</Label> : null}
            {children}
            {error ? (
                <InputError message={error} />
            ) : hint ? (
                <React.Fragment>
                  {/* hint optionnel */}
                </React.Fragment>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 6,
    },
});