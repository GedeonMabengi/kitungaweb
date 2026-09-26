// src/components/layout/NavMain.tsx
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

import type { NavItem } from '../../types/navigation';

const P = {
    fg: '#18181B',
    muted: '#71717A',
    activeBg: '#F4F4F5',
    activeFg: '#18181B',
    groupLabel: '#71717A',
};

export type NavMainProps = {
    items: NavItem[];
    label?: string;
    /** Navigation du drawer (fournie par DrawerContentComponentProps) */
    navigation: any;
};

export function NavMain({ items = [], label = 'Platform', navigation }: NavMainProps) {
    const route = useRoute();

    return (
        <View style={styles.group}>
            {label ? <Text style={styles.groupLabel}>{label}</Text> : null}
            <View style={styles.menu}>
                {items.map((item) => {
                    const isActive = route.name === item.route;
                    const Icon = item.icon;

                    return (
                        <Pressable
                            key={item.title}
                            onPress={() =>
                                navigation.navigate(item.route, item.params)
                            }
                            style={({ pressed }) => [
                                styles.button,
                                isActive && styles.buttonActive,
                                pressed && { opacity: 0.7 },
                            ]}
                        >
                            {Icon ? (
                                <Icon
                                    size={18}
                                    color={isActive ? P.activeFg : P.muted}
                                />
                            ) : null}
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.label,
                                    isActive && styles.labelActive,
                                ]}
                            >
                                {item.title}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    group: {
        paddingHorizontal: 8,
        paddingTop: 4,
    },
    groupLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: P.groupLabel,
        paddingHorizontal: 12,
        paddingVertical: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menu: { gap: 2 },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonActive: { backgroundColor: P.activeBg },
    label: { flex: 1, fontSize: 14, color: P.fg },
    labelActive: { fontWeight: '600' },
});