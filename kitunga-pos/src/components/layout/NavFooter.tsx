// src/components/layout/NavFooter.tsx
import * as React from 'react';
import {
    Linking,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

import type { NavItem } from '../../types/navigation';

const P = {
    fg: '#525252',
};

export type NavFooterProps = {
    items: NavItem[];
    navigation?: any;
    style?: StyleProp<ViewStyle>;
};

export function NavFooter({ items, navigation, style }: NavFooterProps) {
    return (
        <View style={[styles.wrap, style]}>
            {items.map((item) => {
                const Icon = item.icon;
                const isExternal = /^https?:\/\//i.test(item.route);

                return (
                    <Pressable
                        key={item.title}
                        onPress={() => {
                            if (isExternal) {
                                Linking.openURL(item.route);
                            } else if (navigation) {
                                navigation.navigate(item.route, item.params);
                            }
                        }}
                        style={({ pressed }) => [
                            styles.button,
                            pressed && { opacity: 0.7 },
                        ]}
                    >
                        {Icon ? <Icon size={18} color={P.fg} /> : null}
                        <Text style={styles.label} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: 8,
        gap: 2,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    label: { flex: 1, fontSize: 14, color: P.fg },
});