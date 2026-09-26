// src/screens/cash/CashListScreen.tsx
import * as React from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Wallet } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { useCashList } from '../../hooks/useCash';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import type { CashRegisterRow } from '../../data/types/cash';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CashListScreen() {
    const navigation = useNavigation<Nav>();
    const { formatCurrency } = useOrganizationCurrency();

    const [status, setStatus] = React.useState<'' | 'OPEN' | 'CLOSED'>('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    const { data, total, loading, refreshing, setFilters, refresh } = useCashList();

    React.useEffect(() => {
        const t = setTimeout(() => {
            setFilters({
                status,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            });
        }, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, startDate, endDate]);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );

    const handleReset = () => {
        setStatus('');
        setStartDate('');
        setEndDate('');
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
                    <View style={{ gap: 16 }}>
                        <View style={styles.header}>
                            <Badge variant="secondary">Caisse</Badge>
                            <Text style={styles.h1}>Historique des caisses</Text>
                            <Text style={styles.subtitle}>
                                Consulte les caisses passées et leurs soldes.
                            </Text>
                        </View>

                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as '' | 'OPEN' | 'CLOSED')}
                            placeholder="Tous les statuts"
                            title="Statut"
                            options={[
                                { label: 'Tous', value: '' },
                                { label: 'Ouvertes', value: 'OPEN' },
                                { label: 'Clôturées', value: 'CLOSED' },
                            ]}
                        />

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    value={startDate}
                                    onChangeText={setStartDate}
                                    placeholder="Du (YYYY-MM-DD)"
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    value={endDate}
                                    onChangeText={setEndDate}
                                    placeholder="Au (YYYY-MM-DD)"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Button
                                variant="outline"
                                onPress={handleReset}
                                style={{ flex: 1 }}
                            >
                                Réinitialiser
                            </Button>
                            <Button
                                onPress={() =>
                                    navigation.navigate('Main', {
                                        screen: 'Cash.Dashboard',
                                    } as any)
                                }
                                style={{ flex: 1 }}
                            >
                                Tableau de caisse
                            </Button>
                        </View>

                        <Text style={styles.counter}>
                            {total} caisse{total > 1 ? 's' : ''}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <RegisterCard
                        register={item}
                        formatCurrency={formatCurrency}
                        onPress={() =>
                            navigation.navigate('Cash.Show', { id: item.id })
                        }
                    />
                )}
                ListEmptyComponent={
                    loading ? (
                        <View style={{ gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={120} borderRadius={12} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Wallet size={32} color={P.muted} />
                            <Text style={styles.emptyText}>
                                Aucune caisse ne correspond aux filtres.
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

function RegisterCard({
    register,
    formatCurrency,
    onPress,
}: {
    register: CashRegisterRow;
    formatCurrency: (n: number) => string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
        >
            <View style={styles.cardTop}>
                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.cardTitle}>Caisse du {register.date}</Text>
                    <Text style={styles.cardSubtitle}>
                        {register.user_name ?? 'Utilisateur'}
                    </Text>
                </View>
                <Badge variant={register.status === 'OPEN' ? 'default' : 'secondary'}>
                    {register.status === 'OPEN' ? 'Ouverte' : 'Clôturée'}
                </Badge>
            </View>

            <View style={styles.cells}>
                <Cell label="Ouverture" value={formatCurrency(register.opening_balance)} />
                <Cell label="Attendu" value={formatCurrency(register.expected_balance)} />
                <Cell
                    label="Réel"
                    value={
                        register.actual_balance != null
                            ? formatCurrency(register.actual_balance)
                            : '-'
                    }
                />
            </View>
        </Pressable>
    );
}

function Cell({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.cell}>
            <Text style={styles.cellLabel}>{label}</Text>
            <Text style={styles.cellValue} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 12, paddingBottom: 40 },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    subtitle: { fontSize: 14, color: P.muted },
    counter: { fontSize: 13, color: P.muted, fontWeight: '500', paddingHorizontal: 4 },

    card: {
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
        gap: 12,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: P.fg },
    cardSubtitle: { fontSize: 13, color: P.muted, marginTop: 2 },
    cells: { flexDirection: 'row', gap: 8 },
    cell: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 8,
        gap: 4,
    },
    cellLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    cellValue: { fontSize: 13, fontWeight: '700', color: P.fg },

    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    emptyText: { color: P.muted, fontSize: 14, textAlign: 'center' },
});