// src/screens/sales/SalesListScreen.tsx
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Receipt } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSales } from '../../hooks/useSales';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import {
    PAYMENT_METHOD_LABELS,
    PAYMENT_STATUS_LABELS,
    type PaymentMethod,
    type PaymentStatus,
    type SaleRow,
} from '../../data/types/sale';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

function statusVariant(
    status: PaymentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'PAID') return 'default';
    if (status === 'CANCELLED') return 'destructive';
    if (status === 'PENDING') return 'secondary';
    return 'outline';
}

export default function SalesListScreen() {
    const navigation = useNavigation<Nav>();
    const { formatCurrency } = useOrganizationCurrency();

    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState<PaymentStatus | ''>('');
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod | ''>('');

    const { data, total, loading, refreshing, setFilters, refresh } = useSales();

    React.useEffect(() => {
        const t = setTimeout(() => {
            setFilters({
                search,
                status,
                payment_method: paymentMethod,
            });
        }, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status, paymentMethod]);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );

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
                            <Badge variant="secondary">Ventes</Badge>
                            <Text style={styles.h1}>Journal des ventes</Text>
                            <Text style={styles.subtitle}>
                                Historique, montants encaissés et modes de paiement.
                            </Text>
                        </View>

                        <Input
                            placeholder="Référence ou client…"
                            value={search}
                            onChangeText={setSearch}
                            autoCapitalize="none"
                        />

                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as PaymentStatus | '')}
                            placeholder="Tous les statuts"
                            title="Statut"
                            options={[
                                { label: 'Tous les statuts', value: '' },
                                { label: 'Payée', value: 'PAID' },
                                { label: 'En attente', value: 'PENDING' },
                                { label: 'Partiel', value: 'PARTIAL' },
                                { label: 'Annulée', value: 'CANCELLED' },
                            ]}
                        />

                        <Select
                            value={paymentMethod}
                            onValueChange={(v) => setPaymentMethod(v as PaymentMethod | '')}
                            placeholder="Tous les paiements"
                            title="Paiement"
                            options={[
                                { label: 'Tous les paiements', value: '' },
                                { label: 'Espèces', value: 'CASH' },
                                { label: 'Carte', value: 'CARD' },
                                { label: 'Mobile Money', value: 'MOBILE' },
                                { label: 'Crédit', value: 'CREDIT' },
                                { label: 'Autre', value: 'OTHER' },
                            ]}
                        />

                        <Text style={styles.counter}>
                            {total} vente{total > 1 ? 's' : ''}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <SaleCard
                        sale={item}
                        formatCurrency={formatCurrency}
                        onPress={() =>
                            navigation.navigate('Sales.Show', { id: item.id })
                        }
                    />
                )}
                ListEmptyComponent={
                    loading ? (
                        <View style={{ gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={100} borderRadius={12} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Receipt size={32} color={P.muted} />
                            <Text style={styles.muted}>
                                Aucune vente ne correspond aux filtres.
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

function SaleCard({
    sale,
    formatCurrency,
    onPress,
}: {
    sale: SaleRow;
    formatCurrency: (n: number) => string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
        >
            <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                    <Receipt size={18} color={P.fg} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {sale.reference}
                    </Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                        {sale.customer_name || 'Client non renseigné'}
                    </Text>
                    <Text style={styles.cardMeta} numberOfLines={1}>
                        {sale.user_name ?? '-'} ·{' '}
                        {PAYMENT_METHOD_LABELS[sale.payment_method]}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBottom}>
                <Badge variant={statusVariant(sale.payment_status)}>
                    {PAYMENT_STATUS_LABELS[sale.payment_status]}
                </Badge>
                <Text style={styles.amount}>{formatCurrency(sale.total_amount)}</Text>
            </View>
        </Pressable>
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
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F4F4F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: P.fg },
    cardSub: { fontSize: 13, color: P.fg, marginTop: 2 },
    cardMeta: { fontSize: 12, color: P.muted, marginTop: 2 },
    cardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    amount: { fontSize: 18, fontWeight: '800', color: P.fg },

    empty: { padding: 40, alignItems: 'center', gap: 12 },
    muted: { color: P.muted, fontSize: 14, textAlign: 'center' },
});