// src/components/layout/NavUser.tsx
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronsUpDown } from 'lucide-react-native';

import { useSessionStore } from '../../store/session.store';
import { Avatar } from '../ui/Avatar';
import { BottomSheet, BottomSheetBody } from '../ui/BottomSheet';
import { UserInfo } from './UserInfo';

const P = {
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
};

export function NavUser() {
    const user = useSessionStore((s) => s.user);
    const [open, setOpen] = React.useState(false);

    if (!user) return null;

    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                style={({ pressed }) => [
                    styles.row,
                    pressed && { opacity: 0.7 },
                ]}
            >
                <UserInfo
                    user={{
                        name: user.name ?? '',
                        email: user.email ?? '',
                        avatar: user.avatar,
                    }}
                />
                <ChevronsUpDown size={16} color={P.muted} />
            </Pressable>

            <BottomSheet
                visible={open}
                onClose={() => setOpen(false)}
                maxHeightRatio={0.6}
            >
                <View style={styles.sheetHeader}>
                    <Avatar
                        name={user.name ?? ''}
                        src={user.avatar}
                        size={40}
                    />
                    <View style={styles.sheetHeaderText}>
                        <Text style={styles.sheetName} numberOfLines={1}>
                            {user.name}
                        </Text>
                        <Text style={styles.sheetEmail} numberOfLines={1}>
                            {user.email}
                        </Text>
                    </View>
                </View>

                <BottomSheetBody>
                    <MenuItem label="Profil" onPress={() => setOpen(false)} />
                    <MenuItem label="Paramètres" onPress={() => setOpen(false)} />
                    <MenuItem label="Apparence" onPress={() => setOpen(false)} />
                    <MenuItem
                        label="Déconnexion"
                        danger
                        onPress={() => setOpen(false)}
                    />
                </BottomSheetBody>
            </BottomSheet>
        </>
    );
}

function MenuItem({
    label,
    onPress,
    danger = false,
}: {
    label: string;
    onPress: () => void;
    danger?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: '#F4F4F5' },
            ]}
        >
            <Text
                style={[
                    styles.menuItemLabel,
                    danger && { color: '#DC2626' },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: P.border,
    },
    sheetHeaderText: { flex: 1, gap: 2 },
    sheetName: { fontSize: 15, fontWeight: '600', color: P.fg },
    sheetEmail: { fontSize: 13, color: P.muted },
    menuItem: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 8,
    },
    menuItemLabel: { fontSize: 15, color: P.fg },
});