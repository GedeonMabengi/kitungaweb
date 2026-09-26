// src/screens/admin/users/UsersListScreen.tsx
import * as React from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    Eye,
    Pencil,
    Power,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react-native';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetHeader,
    BottomSheetTitle,
} from '../../../components/ui/BottomSheet';
import { useUsers } from '../../../hooks/useUsers';
import { UsersRepo } from '../../../data/repositories/users.repo';
import { useAuthorization } from '../../../lib/authorization';
import {
    AVAILABLE_ROLES,
    ROLE_LABELS,
    type UserWithRoles,
} from '../../../data/types/user';
import type { RootStackParamList } from '../../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    rose: '#B91C1C',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function UsersListScreen() {
    const navigation = useNavigation<Nav>();
    const { hasPermission } = useAuthorization();
    const canCreate = hasPermission('users.create') || hasPermission('users.manage');
    const canManage = hasPermission('users.edit') || hasPermission('users.manage');

    const [search, setSearch] = React.useState('');
    const [role, setRole] = React.useState('');
    const [active, setActive] = React.useState<'' | '1' | '0'>('');
    const [actionUser, setActionUser] = React.useState<UserWithRoles | null>(null);

    const { data, loading, refreshing, setFilters, refresh } = useUsers();

    React.useEffect(() => {
        const t = setTimeout(() => {
            setFilters({ search, role: role || undefined, active });
        }, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, role, active]);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );

    const handleToggleActive = (u: UserWithRoles) => {
        Alert.alert(
            u.is_active ? 'Désactiver' : 'Activer',
            `Confirmer pour ${u.name} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        try {
                            await UsersRepo.toggleActive(u.id);
                            refresh();
                        } catch (e) {
                            Alert.alert(
                                'Erreur',
                                e instanceof Error ? e.message : 'Erreur',
                            );
                        }
                    },
                },
            ],
        );
    };

    const handleDelete = (u: UserWithRoles) => {
        Alert.alert(
            'Supprimer',
            `Supprimer définitivement ${u.name} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await UsersRepo.remove(u.id);
                            refresh();
                        } catch (e) {
                            Alert.alert(
                                'Erreur',
                                e instanceof Error ? e.message : 'Erreur',
                            );
                        }
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <FlatList
                data={data}
                keyExtractor={(item) => String(item.id)}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                }
                contentContainerStyle={styles.content}
                ListHeaderComponent={
                    <View style={{ gap: 14 }}>
                        <View style={styles.header}>
                            <Badge variant="secondary">Administration</Badge>
                            <Text style={styles.h1}>Utilisateurs</Text>
                            <Text style={styles.subtitle}>
                                Comptes, rôles et état d’activation.
                            </Text>
                        </View>

                        <Input
                            placeholder="Nom ou email…"
                            value={search}
                            onChangeText={setSearch}
                            autoCapitalize="none"
                        />

                        <Select
                            value={role}
                            onValueChange={setRole}
                            placeholder="Tous les rôles"
                            title="Rôle"
                            options={[
                                { label: 'Tous les rôles', value: '' },
                                ...AVAILABLE_ROLES.map((r) => ({
                                    label: r.label,
                                    value: r.name,
                                })),
                            ]}
                        />

                        <Select
                            value={active}
                            onValueChange={(v) => setActive(v as '' | '1' | '0')}
                            placeholder="Tous les états"
                            title="État"
                            options={[
                                { label: 'Tous les états', value: '' },
                                { label: 'Actifs', value: '1' },
                                { label: 'Inactifs', value: '0' },
                            ]}
                        />

                        {canCreate ? (
                            <Button
                                onPress={() =>
                                    navigation.navigate('Admin.Users.Create')
                                }
                                leftIcon={<UserPlus size={16} color="#FAFAFA" />}
                            >
                                Nouvel utilisateur
                            </Button>
                        ) : null}

                        <Text style={styles.counter}>
                            {data.length} utilisateur{data.length > 1 ? 's' : ''}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                            navigation.navigate('Admin.Users.Show', { id: item.id })
                        }
                        onLongPress={
                            canManage ? () => setActionUser(item) : undefined
                        }
                        delayLongPress={300}
                        style={({ pressed }) => [
                            styles.card,
                            pressed && { opacity: 0.9 },
                        ]}
                    >
                        <View style={styles.cardTop}>
                            <View style={styles.iconBox}>
                                <Users size={18} color={P.fg} />
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text style={styles.email} numberOfLines={1}>
                                    {item.email}
                                </Text>
                                <View style={styles.rolesRow}>
                                    {item.role_names.length === 0 ? (
                                        <Badge variant="outline">Sans rôle</Badge>
                                    ) : (
                                        item.role_names.map((r) => (
                                            <Badge key={r} variant="outline">
                                                {ROLE_LABELS[r] ?? r}
                                            </Badge>
                                        ))
                                    )}
                                </View>
                            </View>
                            <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                {item.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    loading ? (
                        <View style={{ gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={110} borderRadius={12} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Text style={styles.muted}>
                                Aucun utilisateur ne correspond aux filtres.
                            </Text>
                        </View>
                    )
                }
            />

            <BottomSheet
                visible={!!actionUser}
                onClose={() => setActionUser(null)}
                maxHeightRatio={0.55}
            >
                <BottomSheetHeader>
                    <BottomSheetTitle>{actionUser?.name}</BottomSheetTitle>
                </BottomSheetHeader>
                <BottomSheetBody>
                    <Button
                        variant="outline"
                        leftIcon={<Eye size={16} color="#18181B" />}
                        onPress={() => {
                            const u = actionUser;
                            setActionUser(null);
                            if (u)
                                navigation.navigate('Admin.Users.Show', { id: u.id });
                        }}
                    >
                        Voir le détail
                    </Button>
                    {canManage ? (
                        <>
                            <Button
                                variant="outline"
                                leftIcon={<Pencil size={16} color="#18181B" />}
                                onPress={() => {
                                    const u = actionUser;
                                    setActionUser(null);
                                    if (u)
                                        navigation.navigate('Admin.Users.Edit', {
                                            id: u.id,
                                        });
                                }}
                            >
                                Modifier
                            </Button>
                            <Button
                                variant="outline"
                                leftIcon={<Power size={16} color="#18181B" />}
                                onPress={() => {
                                    const u = actionUser;
                                    setActionUser(null);
                                    if (u) handleToggleActive(u);
                                }}
                            >
                                {actionUser?.is_active ? 'Désactiver' : 'Activer'}
                            </Button>
                            <Button
                                variant="destructive"
                                leftIcon={<Trash2 size={16} color="#FAFAFA" />}
                                onPress={() => {
                                    const u = actionUser;
                                    setActionUser(null);
                                    if (u) handleDelete(u);
                                }}
                            >
                                Supprimer
                            </Button>
                        </>
                    ) : null}
                </BottomSheetBody>
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 12, paddingBottom: 40 },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    subtitle: { fontSize: 14, color: P.muted },
    counter: { fontSize: 13, color: P.muted, fontWeight: '500' },

    card: {
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F4F4F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: { fontSize: 15, fontWeight: '700', color: P.fg },
    email: { fontSize: 13, color: P.muted, marginTop: 2 },
    rolesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 8,
    },
    empty: { padding: 40, alignItems: 'center' },
    muted: { color: P.muted, fontSize: 14, textAlign: 'center' },
});