// src/components/layout/AppHeader.tsx
import * as React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Menu, ArrowLeft, Search } from 'lucide-react-native';

import { useSessionStore } from '../../store/session.store';
import { Avatar } from '../ui/Avatar';

const P = {
    background: '#FFFFFF',
    border: '#E4E4E7',
    fg: '#18181B',
    muted: '#71717A',
};

export function AppHeader({ options, route, back }: NativeStackHeaderProps) {
    const user = useSessionStore((s) => s.user);
    const navigation = useNavigation<any>();

    // Si on peut revenir en arrière → flèche ; sinon → burger
    const canGoBack = !!back;
    // Si on est dans un Drawer, on peut ouvrir le drawer
    const parent = navigation.getParent();
    const showDrawer = !canGoBack && parent?.getState()?.type === 'drawer';

    const title = options.title ?? route.name;

    const openDrawer = () => {
        if (parent?.openDrawer) parent.openDrawer();
    };

    return (
        <View style={[styles.container, { paddingTop: 0 }]}>
            <View style={styles.row}>
                {/* Left : burger OU retour */}
                <Pressable
                    onPress={canGoBack ? () => navigation.goBack() : openDrawer}
                    hitSlop={10}
                    style={({ pressed }) => [
                        styles.iconBtn,
                        pressed && { opacity: 0.7 },
                    ]}
                >
                    {canGoBack ? (
                        <ArrowLeft size={22} color={P.fg} />
                    ) : showDrawer ? (
                        <Menu size={22} color={P.fg} />
                    ) : null}
                </Pressable>

                {/* Center : titre */}
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                {/* Right : recherche + avatar */}
                <View style={styles.right}>
                    <Pressable
                        onPress={() => navigation.navigate('Search')}
                        hitSlop={10}
                        style={({ pressed }) => [
                            styles.iconBtn,
                            pressed && { opacity: 0.7 },
                        ]}
                    >
                        <Search size={20} color={P.fg} />
                    </Pressable>

                    {user ? (
                        <Pressable
                            onPress={() => navigation.navigate('Settings.Profile')}
                            hitSlop={6}
                            style={({ pressed }) => [
                                pressed && { opacity: 0.8 },
                            ]}
                        >
                            <Avatar
                                name={user.name ?? ''}
                                src={user.avatar}
                                size={30}
                            />
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: P.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: P.border,
    },
    row: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        gap: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: P.fg,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});