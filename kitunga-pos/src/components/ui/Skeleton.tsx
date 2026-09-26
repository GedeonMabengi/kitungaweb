// src/components/ui/Skeleton.tsx
import * as React from 'react';
import {
    Animated,
    DimensionValue,
    Easing,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from 'react-native';

const P = {
    base: 'rgba(24, 24, 27, 0.10)', // équivalent bg-primary/10
};

export type SkeletonProps = {
    width?: DimensionValue;
    height?: DimensionValue;
    /** Rend un cercle (utile pour avatar) */
    circle?: boolean;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
};

export function Skeleton({
    width = '100%',
    height = 16,
    circle = false,
    borderRadius,
    style,
    testID,
}: SkeletonProps) {
    const opacity = React.useRef(new Animated.Value(0.5)).current;

    React.useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    const size = circle
        ? { width: height, height, borderRadius: Number(height) / 2 }
        : {
              width,
              height,
              borderRadius: borderRadius ?? 6,
          };

    return (
        <Animated.View
            testID={testID}
            style={[
                { backgroundColor: P.base, opacity },
                size,
                style,
            ]}
        />
    );
}