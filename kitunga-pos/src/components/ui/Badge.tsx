// src/components/ui/Badge.tsx
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

const P = {
    primary: '#18181B',
    primaryFg: '#FAFAFA',
    secondary: '#F4F4F5',
    secondaryFg: '#18181B',
    destructive: '#DC2626',
    destructiveFg: '#FFFFFF',
    border: '#E4E4E7',
    fg: '#18181B',
};

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export type BadgeProps = {
    children?: React.ReactNode;
    variant?: BadgeVariant;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onPress?: () => void;
    testID?: string;
};

/**
 * Retourne true si l’enfant est un texte simple
 * (string, number, ou tableau ne contenant que des string/number).
 */
function isTextLike(children: React.ReactNode): boolean {
    if (typeof children === 'string' || typeof children === 'number') {
        return true;
    }
    if (Array.isArray(children)) {
        return children.every(
            (c) => typeof c === 'string' || typeof c === 'number',
        );
    }
    return false;
}

export function Badge({
    children,
    variant = 'default',
    style,
    textStyle,
    leftIcon,
    rightIcon,
    onPress,
    testID,
}: BadgeProps) {
    const v = variantStyles[variant];

    const content = (
        <>
            {leftIcon}
            {isTextLike(children) ? (
                <Text style={[styles.text, v.text, textStyle]} numberOfLines={1}>
                    {children}
                </Text>
            ) : (
                children
            )}
            {rightIcon}
        </>
    );

    if (onPress) {
        return (
            <Pressable
                testID={testID}
                onPress={onPress}
                style={({ pressed }) => [
                    styles.badge,
                    v.container,
                    pressed && { opacity: 0.85 },
                    style,
                ]}
            >
                {content}
            </Pressable>
        );
    }

    return (
        <View testID={testID} style={[styles.badge, v.container, style]}>
            {content}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 4,
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },
});

const variantStyles: Record<
    BadgeVariant,
    { container: ViewStyle; text: TextStyle }
> = {
    default: {
        container: { backgroundColor: P.primary, borderColor: 'transparent' },
        text: { color: P.primaryFg },
    },
    secondary: {
        container: { backgroundColor: P.secondary, borderColor: 'transparent' },
        text: { color: P.secondaryFg },
    },
    destructive: {
        container: { backgroundColor: P.destructive, borderColor: 'transparent' },
        text: { color: P.destructiveFg },
    },
    outline: {
        container: { backgroundColor: 'transparent', borderColor: P.border },
        text: { color: P.fg },
    },
};