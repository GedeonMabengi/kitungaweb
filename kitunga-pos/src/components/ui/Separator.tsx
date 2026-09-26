// src/components/ui/Separator.tsx
import * as React from 'react';
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

const P = {
    border: '#E4E4E7',
};

export type SeparatorProps = {
    orientation?: 'horizontal' | 'vertical';
    /** Épaisseur en pixels (défaut : StyleSheet.hairlineWidth) */
    thickness?: number;
    /** Couleur (défaut : gris clair) */
    color?: string;
    /** Marge autour (ex : 16, ou { horizontal: 16, vertical: 8 }) */
    inset?: number | { horizontal?: number; vertical?: number };
    /** Purement décoratif (ignoré par les lecteurs d'écran) */
    decorative?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
};

export function Separator({
    orientation = 'horizontal',
    thickness,
    color = P.border,
    inset = 0,
    decorative = true,
    style,
    testID,
}: SeparatorProps) {
    const isHorizontal = orientation === 'horizontal';
    const t = thickness ?? StyleSheet.hairlineWidth;

    const insetStyle: ViewStyle =
        typeof inset === 'number'
            ? isHorizontal
                ? { marginHorizontal: inset }
                : { marginVertical: inset }
            : isHorizontal
              ? { marginHorizontal: inset.horizontal ?? 0 }
              : { marginVertical: inset.vertical ?? 0 };

    return (
        <View
            testID={testID}
            accessibilityRole={decorative ? 'none' : 'adjustable'}
            style={[
                isHorizontal
                    ? { height: t, width: '100%' }
                    : { width: t, alignSelf: 'stretch' },
                { backgroundColor: color },
                insetStyle,
                style,
            ]}
        />
    );
}