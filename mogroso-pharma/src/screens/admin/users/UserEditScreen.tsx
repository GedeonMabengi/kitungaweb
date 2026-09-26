// src/screens/admin/users/UserEditScreen.tsx
import * as React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import UserForm from './UserForm';
import { UsersRepo } from '../../../data/repositories/users.repo';
import type { UserWithRoles } from '../../../data/types/user';
import type { RootStackParamList } from '../../../navigation/types';

type Route = RouteProp<RootStackParamList, 'Admin.Users.Edit'>;

export default function UserEditScreen() {
    const { id } = useRoute<Route>().params;
    const [user, setUser] = React.useState<UserWithRoles | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const row = await UsersRepo.find(id);
            setUser(row);
            setLoading(false);
        })();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Utilisateur introuvable.</Text>
            </View>
        );
    }

    return <UserForm mode="edit" user={user} />;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#FAFAFA',
    },
    text: { color: '#71717A' },
});