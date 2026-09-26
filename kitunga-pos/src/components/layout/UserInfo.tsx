// src/components/layout/UserInfo.tsx
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';

export function getInitials(name?: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type UserInfoProps = {
    user: Pick<User, 'name' | 'email' | 'avatar'>;
    showEmail?: boolean;
    avatarSize?: number;
};

export function UserInfo({
    user,
    showEmail = false,
    avatarSize = 32,
}: UserInfoProps) {
    return (
        <View style={styles.row}>
            <Avatar name={user.name} src={user.avatar} size={avatarSize} />
            <View style={styles.text}>
                <Text style={styles.name} numberOfLines={1}>
                    {user.name}
                </Text>
                {showEmail ? (
                    <Text style={styles.email} numberOfLines={1}>
                        {user.email}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    text: {
        flex: 1,
        gap: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '500',
        color: '#18181B',
    },
    email: {
        fontSize: 12,
        color: '#71717A',
    },
});