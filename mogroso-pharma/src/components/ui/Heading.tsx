// src/components/ui/Heading.tsx
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
    fg: '#18181B',
    muted: '#71717A',
};

export type HeadingProps = {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
};

export function Heading({
    title,
    description,
    variant = 'default',
    style,
    titleStyle,
    descriptionStyle,
}: HeadingProps) {
    const isSmall = variant === 'small';

    return (
        <View style={[isSmall ? styles.containerSmall : styles.container, style]}>
            <Text
                style={[
                    isSmall ? styles.titleSmall : styles.title,
                    titleStyle,
                ]}
            >
                {title}
            </Text>
            {description ? (
                <Text style={[styles.description, descriptionStyle]}>
                    {description}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
        gap: 2,
    },
    containerSmall: {
        marginBottom: 2,
        gap: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: P.fg,
        letterSpacing: -0.3,
    },
    titleSmall: {
        fontSize: 16,
        fontWeight: '500',
        color: P.fg,
    },
    description: {
        fontSize: 14,
        color: P.muted,
    },
});