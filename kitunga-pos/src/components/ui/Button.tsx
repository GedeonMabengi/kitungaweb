// src/components/ui/Button.tsx
import * as React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

export type ButtonVariant =
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export type ButtonProps = {
    children?: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    testID?: string;
};

// Palette locale — on centralisera dans src/theme plus tard
const P = {
    primary: '#18181B',
    primaryFg: '#FAFAFA',
    destructive: '#DC2626',
    destructiveFg: '#FFFFFF',
    secondary: '#F4F4F5',
    secondaryFg: '#18181B',
    border: '#E4E4E7',
    background: '#FFFFFF',
    fg: '#18181B',
    accent: '#F4F4F5',
    accentFg: '#18181B',
};

const SIZES: Record<ButtonSize, { height: number; px: number; fontSize: number; radius: number; gap: number }> = {
    default: { height: 40, px: 16, fontSize: 14, radius: 8, gap: 8 },
    sm:      { height: 34, px: 12, fontSize: 13, radius: 8, gap: 6 },
    lg:      { height: 48, px: 24, fontSize: 15, radius: 8, gap: 8 },
    icon:    { height: 40, px: 0,  fontSize: 14, radius: 8, gap: 0 },
};

export function Button({
    children,
    variant = 'default',
    size = 'default',
    disabled = false,
    loading = false,
    onPress,
    onLongPress,
    style,
    textStyle,
    leftIcon,
    rightIcon,
    fullWidth = false,
    testID,
}: ButtonProps) {
    const isInactive = disabled || loading;
    const s = SIZES[size];

    const containerStyle: ViewStyle = {
        height: s.height,
        paddingHorizontal: s.px,
        borderRadius: s.radius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        width: size === 'icon' ? s.height : fullWidth ? '100%' : undefined,
        ...variantStyles[variant].container,
    };

    const labelStyle: TextStyle = {
        fontSize: s.fontSize,
        fontWeight: '600',
        ...variantStyles[variant].label,
    };

    const color = (variantStyles[variant].label.color as string) ?? P.fg;

    return (
        <Pressable
            testID={testID}
            onPress={isInactive ? undefined : onPress}
            onLongPress={isInactive ? undefined : onLongPress}
            disabled={isInactive}
            style={({ pressed }) => [
                containerStyle,
                pressed && !isInactive && { opacity: 0.85 },
                isInactive && { opacity: 0.5 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={color} />
            ) : (
                <>
                    {leftIcon ? <View>{leftIcon}</View> : null}
                    {typeof children === 'string' ? (
                        <Text style={[labelStyle, textStyle]} numberOfLines={1}>
                            {children}
                        </Text>
                    ) : (
                        children
                    )}
                    {rightIcon ? <View>{rightIcon}</View> : null}
                </>
            )}
        </Pressable>
    );
}

const variantStyles: Record<
    ButtonVariant,
    { container: ViewStyle; label: TextStyle }
> = {
    default: {
        container: { backgroundColor: P.primary },
        label: { color: P.primaryFg },
    },
    destructive: {
        container: { backgroundColor: P.destructive },
        label: { color: P.destructiveFg },
    },
    outline: {
        container: {
            backgroundColor: P.background,
            borderWidth: 1,
            borderColor: P.border,
        },
        label: { color: P.fg },
    },
    secondary: {
        container: { backgroundColor: P.secondary },
        label: { color: P.secondaryFg },
    },
    ghost: {
        container: { backgroundColor: 'transparent' },
        label: { color: P.fg },
    },
    link: {
        container: { backgroundColor: 'transparent', paddingHorizontal: 0 },
        label: { color: P.primary, textDecorationLine: 'underline' },
    },
};