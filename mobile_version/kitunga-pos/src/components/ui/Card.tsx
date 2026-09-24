// src/components/ui/Card.tsx
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
    background: '#FFFFFF',
    border: '#E4E4E7',
    fg: '#18181B',
    muted: '#71717A',
};

// -------------------------------------------------------------
// Card — conteneur principal
// -------------------------------------------------------------
export type CardProps = {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    /** Rend la carte cliquable (feedback visuel au press) */
    onPress?: () => void;
    onLongPress?: () => void;
    disabled?: boolean;
    testID?: string;
};

export function Card({
    children,
    style,
    onPress,
    onLongPress,
    disabled = false,
    testID,
}: CardProps) {
    // Carte cliquable → Pressable ; sinon → View simple
    if (onPress || onLongPress) {
        return (
            <Pressable
                testID={testID}
                onPress={onPress}
                onLongPress={onLongPress}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.card,
                    pressed && !disabled && styles.cardPressed,
                    disabled && styles.cardDisabled,
                    style,
                ]}
            >
                {children}
            </Pressable>
        );
    }

    return (
        <View testID={testID} style={[styles.card, style]}>
            {children}
        </View>
    );
}

// -------------------------------------------------------------
// CardHeader
// -------------------------------------------------------------
export function CardHeader({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return <View style={[styles.header, style]}>{children}</View>;
}

// -------------------------------------------------------------
// CardTitle (⚠️ Text, pas View)
// -------------------------------------------------------------
export function CardTitle({
    children,
    style,
    numberOfLines,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
}) {
    return (
        <Text
            numberOfLines={numberOfLines}
            style={[styles.title, style]}
        >
            {children}
        </Text>
    );
}

// -------------------------------------------------------------
// CardDescription (⚠️ Text, pas View)
// -------------------------------------------------------------
export function CardDescription({
    children,
    style,
    numberOfLines,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
}) {
    return (
        <Text
            numberOfLines={numberOfLines}
            style={[styles.description, style]}
        >
            {children}
        </Text>
    );
}

// -------------------------------------------------------------
// CardContent
// -------------------------------------------------------------
export function CardContent({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return <View style={[styles.content, style]}>{children}</View>;
}

// -------------------------------------------------------------
// CardFooter
// -------------------------------------------------------------
export function CardFooter({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return <View style={[styles.footer, style]}>{children}</View>;
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------
const styles = StyleSheet.create({
    card: {
        backgroundColor: P.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        paddingVertical: 24,
        // Ombre iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        // Ombre Android
        elevation: 1,
    },
    cardPressed: {
        opacity: 0.9,
    },
    cardDisabled: {
        opacity: 0.5,
    },
    header: {
        paddingHorizontal: 24,
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: P.fg,
        lineHeight: 20,
    },
    description: {
        fontSize: 14,
        color: P.muted,
        lineHeight: 18,
    },
    content: {
        paddingHorizontal: 24,
    },
    footer: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
});