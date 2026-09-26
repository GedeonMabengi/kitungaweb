// src/components/ui/Spinner.tsx
import * as React from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { Loader2 } from 'lucide-react-native';

const P = {
    fg: '#18181B',
};

export type SpinnerProps = {
    /** Taille de l'icône en pixels (défaut : 16 → équivalent size-4) */
    size?: number;
    /** Couleur (défaut : noir) */
    color?: string;
    style?: StyleProp<ViewStyle>;
    testID?: string;
};

export function Spinner({
    size = 16,
    color = P.fg,
    style,
    testID,
}: SpinnerProps) {
    const rotation = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );
        animation.start();
        return () => animation.stop();
    }, [rotation]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            testID={testID}
            style={[{ transform: [{ rotate: spin }] }, style]}
        >
            <Loader2 size={size} color={color} />
        </Animated.View>
    );
}