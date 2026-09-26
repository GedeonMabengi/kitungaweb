// src/screens/admin/users/UserShowScreen.tsx
import * as React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Activity, Pencil, ShoppingCart, Users } from 'lucide-react-native';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Separator } from '../../../components/ui/Separator';
import { useUserDetail } from '../../../hooks/useUsers';
import { useOrganizationCurrency } from '../../../hooks/useOrganizationCurrency';
import { ROLE_LABELS } from '../../../data/types/user';
import type { RootStackParamList } from '../../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Route = RouteProp<RootStackParamList, 'Admin.Users.Show'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function UserShowScreen() {
    const { id } = useRoute<Route>().params;
    const navigation = useNavigation<Nav>();
    const { formatCurrency } = useOrganizationCurrency();
    const { user, stats, loading } = useUserDetail(id);

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
                <Text style={styles.muted}>Utilisateur introuvable.</Text>
            </View>
        );
    }

    const primaryRole = user.role_names[0];

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={{ gap: 8 }}>
                <Badge variant="secondary">Administration</Badge>
                <Text style={styles.h1}>{user.name}</Text>
                <Text style={styles.muted}>{user.email}</Text>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                </Badge>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <Button
                        onPress={() =>
                            navigation.navigate('Admin.Users.Edit', { id: user.id })
                        }
                        leftIcon={<Pencil size={16} color="#FAFAFA" />}
                        style={{ flex: 1 }}
                    >
                        Modifier
                    </Button>
                    <Button
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        style={{ flex: 1 }}
                    >
                        Retour
                    </Button>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
                <StatCard
                    label="Ventes"
                    value={String(stats.total_sales)}
                />
                <StatCard
                    label="CA"
                    value={formatCurrency(stats.total_sales_amount)}
                />
                <StatCard
                    label="Mvts stock"
                    value={String(stats.stock_movements)}
                />
            </View>

            {/* Profil */}
            <Card>
                <CardContent>
                    <Text style={styles.sectionLabel}>Profil</Text>
                    <Text style={styles.h2}>Informations du compte</Text>

                    <Separator style={{ marginVertical: 14 }} />

                    <View style={styles.dl}>
                        <Field label="Nom" value={user.name} />
                        <Field label="Email" value={user.email} />
                        <Field label="Téléphone" value={user.phone ?? '-'} />
                        <Field
                            label="Statut"
                            value={user.is_active ? 'Actif' : 'Inactif'}
                        />
                    </View>
                </CardContent>
            </Card>

            {/* Rôle + activité */}
            <View style={styles.cardsRow}>
                <SmallCard
                    icon={<Users size={18} color={P.fg} />}
                    label="Rôle"
                    value={primaryRole ? ROLE_LABELS[primaryRole] ?? primaryRole : '-'}
                />
                <SmallCard
                    icon={<ShoppingCart size={18} color={P.fg} />}
                    label="Ventes"
                    value={String(stats.total_sales)}
                />
                <SmallCard
                    icon={<Activity size={18} color={P.fg} />}
                    label="Mouvements"
                    value={String(stats.stock_movements)}
                />
            </View>
        </ScrollView>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
        </View>
    );
}

function SmallCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.smallCard}>
            <View style={styles.smallIconBox}>{icon}</View>
            <Text style={styles.smallLabel}>{label}</Text>
            <Text style={styles.smallValue} numberOfLines={1}>{value}</Text>
        </View>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue} numberOfLines={2}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: P.bg,
    },
    content: { padding: 16, gap: 16, backgroundColor: P.bg, paddingBottom: 40 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    h2: { fontSize: 18, fontWeight: '700', color: P.fg },
    muted: { fontSize: 13, color: P.muted },

    statsGrid: { flexDirection: 'row', gap: 10 },
    statCard: {
        flex: 1,
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 12,
        gap: 4,
    },
    statLabel: { fontSize: 12, color: P.muted },
    statValue: { fontSize: 16, fontWeight: '800', color: P.fg, marginTop: 4 },

    sectionLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dl: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
    field: { width: '50%', paddingRight: 12 },
    fieldLabel: { fontSize: 12, color: P.muted },
    fieldValue: { fontSize: 14, fontWeight: '600', color: P.fg, marginTop: 2 },

    cardsRow: { flexDirection: 'row', gap: 10 },
    smallCard: {
        flex: 1,
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 12,
        gap: 6,
    },
    smallIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F4F4F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallLabel: { fontSize: 11, color: P.muted, marginTop: 4 },
    smallValue: { fontSize: 14, fontWeight: '700', color: P.fg },
});