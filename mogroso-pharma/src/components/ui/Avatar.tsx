// src/components/ui/Avatar.tsx
import * as React from 'react';
import { Image } from 'expo-image';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

const P = {
    background: '#F4F4F5',
    fg: '#18181B',
    border: '#E4E4E7',
};

export type AvatarProps = {
    /** URL de l'image (optionnel). Si absent ou invalide → initiales */
    src?: string | null;
    /** Nom complet pour générer les initiales (ex : "Gédéon K." → "GK") */
    name?: string | null;
    /** Diamètre en pixels (défaut : 32) */
    size?: number;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    /** Petit rond de statut en bas à droite (ex : en ligne) */
    badge?: React.ReactNode;
    testID?: string;
};

export function Avatar({
    src,
    name,
    size = 32,
    style,
    onPress,
    badge,
    testID,
}: AvatarProps) {
    const [imageError, setImageError] = React.useState(false);
    const showImage = !!src && !imageError;

    const initials = React.useMemo(() => getInitials(name), [name]);

    const radius = size / 2;

    const content = (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: radius,
                },
                style,
            ]}
        >
            {showImage ? (
                <Image
                    source={{ uri: src! }}
                    style={{ width: size, height: size }}
                    contentFit="cover"
                    transition={150}
                    onError={() => setImageError(true)}
                    cachePolicy="memory-disk"
                />
            ) : (
                <Text
                    style={[
                        styles.initials,
                        { fontSize: Math.round(size * 0.4) },
                    ]}
                    numberOfLines={1}
                >
                    {initials}
                </Text>
            )}

            {badge ? <View style={styles.badge}>{badge}</View> : null}
        </View>
    );

    if (onPress) {
        return (
            <Pressable
                testID={testID}
                onPress={onPress}
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
                {content}
            </Pressable>
        );
    }

    return <View testID={testID}>{content}</View>;
}

/** Génère les initiales depuis un nom complet. */
function getInitials(name?: string | null): string {
    if (!name) return '?';

    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: P.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: P.border,
    },
    initials: {
        color: P.fg,
        fontWeight: '600',
    },
    badge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
    },
});