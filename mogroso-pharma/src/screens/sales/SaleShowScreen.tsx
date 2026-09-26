// src/screens/sales/SaleShowScreen.tsx
import * as React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ban, Printer } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Separator } from '../../components/ui/Separator';
import { useSaleDetail } from '../../hooks/useSales';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { useOrganizationStore } from '../../store/organization.store';
import { SalesRepo } from '../../data/repositories/sales.repo';
import {
    PAYMENT_METHOD_LABELS,
    PAYMENT_STATUS_LABELS,
    type PaymentStatus,
} from '../../data/types/sale';
import { PrinterService } from '../../lib/printerNative';
import { SystemPrinterService } from '../../lib/systemPrinter';
import { useAuthorization } from '../../lib/authorization';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    emerald: '#047857',
};

type Route = RouteProp<RootStackParamList, 'Sales.Show'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function statusVariant(
    status: PaymentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'PAID') return 'default';
    if (status === 'CANCELLED') return 'destructive';
    if (status === 'PENDING') return 'secondary';
    return 'outline';
}

export default function SaleShowScreen() {
    const { id } = useRoute<Route>().params;
    const navigation = useNavigation<Nav>();
    const { formatCurrency } = useOrganizationCurrency();
    const { hasPermission } = useAuthorization();

    const { sale, items, loading, refresh } = useSaleDetail(id);

    const canCancel =
        hasPermission('sales.edit') || hasPermission('sales.manage');

    const organizationName = useOrganizationStore(
        (state) => state.organization?.name ?? 'Ma Boutique',
    );

    const handlePrint = async (mode: 'bluetooth' | 'system') => {
        if (!sale) return;
        try {
            if (mode === 'system') {
                await SystemPrinterService.printReceipt(
                    sale,
                    items,
                    organizationName,
                    formatCurrency,
                );
            } else {
                const result = await PrinterService.printReceipt(
                    sale,
                    items,
                    organizationName,
                    formatCurrency,
                );
                if (!result.success) {
                    throw new Error(result.error ?? 'Impression impossible.');
                }
            }
            Alert.alert('Impression', 'Le reçu a été envoyé.');
        } catch (error) {
            Alert.alert(
                'Impression impossible',
                error instanceof Error ? error.message : 'Erreur d’impression.',
            );
        }
    };

    const handleCancel = () => {
        if (!sale) return;
        Alert.alert(
            'Annuler la vente',
            `Confirmer l’annulation de ${sale.reference} ? Le stock sera restauré.`,
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SalesRepo.cancel(sale.id);
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

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!sale) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Vente introuvable.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={{ gap: 8 }}>
                <Badge variant="secondary">Vente</Badge>
                <Text style={styles.h1}>{sale.reference}</Text>
                <Text style={styles.muted}>
                    {sale.user_name ?? '-'} · {formatDate(sale.created_at)}
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <Button
                        variant="outline"
                        onPress={() => Alert.alert('Mode d’impression', 'Choisis le mode à utiliser.', [{ text: 'Bluetooth POS', onPress: () => void handlePrint('bluetooth') }, { text: 'Impression système', onPress: () => void handlePrint('system') }, { text: 'Annuler', style: 'cancel' }])}
                        leftIcon={<Printer size={16} color="#18181B" />}
                        style={{ flex: 1 }}
                    >
                        Imprimer
                    </Button>
                    {canCancel && sale.payment_status !== 'CANCELLED' ? (
                        <Button
                            variant="destructive"
                            onPress={handleCancel}
                            leftIcon={<Ban size={16} color="#FAFAFA" />}
                            style={{ flex: 1 }}
                        >
                            Annuler
                        </Button>
                    ) : null}
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
                <StatCard label="Total" value={formatCurrency(sale.total_amount)} />
                <StatCard label="Payé" value={formatCurrency(sale.amount_paid)} />
                <StatCard label="Rendu" value={formatCurrency(sale.change_amount)} />
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Statut</Text>
                    <View style={{ marginTop: 8 }}>
                        <Badge variant={statusVariant(sale.payment_status)}>
                            {PAYMENT_STATUS_LABELS[sale.payment_status]}
                        </Badge>
                    </View>
                </View>
            </View>

            {/* Infos générales */}
            <Card>
                <CardContent>
                    <Text style={styles.sectionLabel}>Informations</Text>
                    <Text style={styles.h2}>Détails de la vente</Text>

                    <Separator style={{ marginVertical: 14 }} />

                    <View style={styles.dl}>
                        <Field label="Vendeur" value={sale.user_name ?? '-'} />
                        <Field
                            label="Paiement"
                            value={PAYMENT_METHOD_LABELS[sale.payment_method]}
                        />
                        <Field
                            label="Client"
                            value={sale.customer_name || 'Non renseigné'}
                        />
                        <Field
                            label="Téléphone"
                            value={sale.customer_phone || '-'}
                        />
                        <Field
                            label="Caisse"
                            value={String(sale.cash_register_id ?? '-')}
                        />
                        <Field
                            label="Articles"
                            value={String(items.length)}
                        />
                    </View>
                </CardContent>
            </Card>

            {/* Résumé financier */}
            <Card>
                <CardContent>
                    <Text style={styles.h2}>Résumé financier</Text>
                    <View style={{ marginTop: 12, gap: 8 }}>
                        <Row label="Sous-total" value={formatCurrency(sale.subtotal)} />
                        <Row label="Remise" value={formatCurrency(sale.discount)} />
                        <Row label="Taxe" value={formatCurrency(sale.tax)} />
                        <Separator style={{ marginVertical: 6 }} />
                        <Row
                            label="Total net"
                            value={formatCurrency(sale.total_amount)}
                            big
                        />
                    </View>
                </CardContent>
            </Card>

            {/* Articles */}
            <Card>
                <CardContent>
                    <Text style={styles.h2}>Articles vendus</Text>
                    <View style={{ gap: 8, marginTop: 12 }}>
                        {items.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.muted}>
                                    Aucun article rattaché à cette vente.
                                </Text>
                            </View>
                        ) : (
                            items.map((it) => (
                                <View key={it.id} style={styles.itemRow}>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={styles.itemTitle} numberOfLines={1}>
                                            {it.article_name ?? '-'}
                                        </Text>
                                        <Text style={styles.itemMeta}>
                                            {it.quantity} {it.quantity_type} ·{' '}
                                            {formatCurrency(it.unit_price)} / u.
                                        </Text>
                                    </View>
                                    <Text style={styles.itemTotal}>
                                        {formatCurrency(it.subtotal)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </CardContent>
            </Card>
        </ScrollView>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue} numberOfLines={2}>
                {value}
            </Text>
        </View>
    );
}

function Row({
    label,
    value,
    big = false,
}: {
    label: string;
    value: string;
    big?: boolean;
}) {
    return (
        <View style={styles.rowBetween}>
            <Text style={[styles.rowLabel, big && styles.rowLabelBig]}>
                {label}
            </Text>
            <Text style={[styles.rowValue, big && styles.rowValueBig]}>
                {value}
            </Text>
        </View>
    );
}

function formatDate(value?: string | null): string {
    if (!value) return '-';
    const d = new Date(value.replace(' ', 'T'));
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
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

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: {
        width: '48%',
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

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLabel: { fontSize: 13, color: P.muted },
    rowValue: { fontSize: 14, fontWeight: '600', color: P.fg },
    rowLabelBig: { fontSize: 14, fontWeight: '700', color: P.fg },
    rowValueBig: { fontSize: 20, fontWeight: '800', color: P.fg },

    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: P.border,
    },
    itemTitle: { fontSize: 14, fontWeight: '600', color: P.fg },
    itemMeta: { fontSize: 12, color: P.muted, marginTop: 2 },
    itemTotal: { fontSize: 14, fontWeight: '700', color: P.fg },

    emptyBox: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: P.border,
        alignItems: 'center',
    },
});