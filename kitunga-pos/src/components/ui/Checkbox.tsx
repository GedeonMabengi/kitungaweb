// src/components/ui/Checkbox.tsx
import * as React from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { Check, Minus } from 'lucide-react-native';

const P = {
    border: '#E4E4E7',
    checked: '#18181B',
    checkedFg: '#FAFAFA',
    invalid: '#DC2626',
    fg: '#18181B',
};

export type CheckboxProps = {
    checked: boolean;
    onCheckedChange?: (checked: boolean) => void;
    /** État intermédiaire (sélection partielle) */
    indeterminate?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    /** Côté du carré en pixels (défaut : 20) */
    size?: number;
    /** Texte à droite (rend toute la ligne cliquable) */
    label?: string;
    labelStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    testID?: string;
};

export function Checkbox({
    checked,
    onCheckedChange,
    indeterminate = false,
    disabled = false,
    invalid = false,
    size = 20,
    label,
    labelStyle,
    style,
    testID,
}: CheckboxProps) {
    const active = checked || indeterminate;

    const handlePress = () => {
        if (disabled) return;
        onCheckedChange?.(!checked);
    };

    const box = (
        <View
            style={[
                styles.box,
                { width: size, height: size, borderRadius: 4 },
                active && styles.boxChecked,
                invalid && styles.boxInvalid,
                disabled && styles.boxDisabled,
            ]}
        >
            {indeterminate ? (
                <Minus size={size * 0.65} color={P.checkedFg} strokeWidth={3} />
            ) : checked ? (
                <Check size={size * 0.65} color={P.checkedFg} strokeWidth={3} />
            ) : null}
        </View>
    );

    // Pas de label : juste la case
    if (!label) {
        return (
            <Pressable
                testID={testID}
                onPress={handlePress}
                disabled={disabled}
                hitSlop={12}
                style={({ pressed }) => [
                    pressed && !disabled && { opacity: 0.7 },
                    style,
                ]}
            >
                {box}
            </Pressable>
        );
    }

    // Avec label : toute la ligne est cliquable
    return (
        <Pressable
            testID={testID}
            onPress={handlePress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.row,
                pressed && !disabled && { opacity: 0.7 },
                style,
            ]}
        >
            {box}
            <Text
                style={[
                    styles.label,
                    disabled && { opacity: 0.5 },
                    labelStyle,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    box: {
        borderWidth: 1.5,
        borderColor: P.border,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxChecked: {
        backgroundColor: P.checked,
        borderColor: P.checked,
    },
    boxInvalid: {
        borderColor: P.invalid,
    },
    boxDisabled: {
        opacity: 0.5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    label: {
        fontSize: 15,
        color: P.fg,
        flexShrink: 1,
    },
});