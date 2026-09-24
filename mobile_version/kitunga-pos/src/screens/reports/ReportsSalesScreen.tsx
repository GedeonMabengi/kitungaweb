// src/screens/reports/ReportsSalesScreen.tsx
import * as React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSalesReport } from '../../hooks/useReports';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { defaultRange } from '../../data/types/reports';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    emerald: '#047857',
};

const DEF = defaultRange();

export default function ReportsSalesScreen() {
    const { formatCurrency } = useOrganizationCurrency();
    const [start, setStart] = React.useState(DEF.start_date);
    const [end, setEnd] = React.useState(DEF.end_date);

    const {
        totals,
        byDay,
        byUser,
        topArticles,
        recent,
        loading,
        setFilters,
    } = useSalesReport({ start_date: DEF.start_date, end_date: DEF.end_date });

    const apply = () => {
        setFilters({ start_date: start, end_date: end });
    };

    if (loading) {
        return (
            <ScrollView contentContainerStyle={styles.content}>
                <Skeleton height={80} borderRadius={12} />
                <Skeleton height={140} borderRadius={12} />
                <Skeleton height={180} borderRadius={12} />
            </ScrollView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Badge variant="secondary">Rapports ventes</Badge>
                    <Text style={styles.h1}>Analyse commerciale</Text>
                </View>

                {/* Filtres */}
                <View style={{ gap: 8 }}>
                    <Input
                        value={start}
                        onChangeText={setStart}
                        placeholder="Du (YYYY-MM-DD)"
                        autoCapitalize="none"
                    />
                    <Input
                        value={end}
                        onChangeText={setEnd}
                        placeholder="Au (YYYY-MM-DD)"
                        autoCapitalize="none"
                    />
                    <Button onPress={apply}>Actualiser</Button>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <StatCard label="Ventes" value={String(totals.count)} />
                    <StatCard
                        label="CA"
                        value={formatCurrency(totals.amount)}
                        color={P.emerald}
                    />
                </View>

                {/* Par jour */}
                <Section title="Ventes par jour" empty={byDay.length === 0} emptyText="Aucune vente sur la période.">
                    {byDay.map((d) => (
                        <Row
                            key={d.date}
                            title={formatDate(d.date)}
                            subtitle={`${d.count} vente(s)`}
                            value={formatCurrency(d.total)}
                            valueColor={P.emerald}
                        />
                    ))}
                </Section>

                {/* Par user */}
                <Section title="Par vendeur" empty={byUser.length === 0} emptyText="Aucune donnée vendeur.">
                    {byUser.map((u) => (
                        <Row
                            key={String(u.user_id ?? 'x')}
                            title={u.user_name ?? 'Utilisateur'}
                            subtitle={`${u.count} vente(s)`}
                            value={formatCurrency(u.total)}
                        />
                    ))}
                </Section>

                {/* Top articles */}
                <Section title="Top articles" empty={topArticles.length === 0} emptyText="Aucun article sur la période.">
                    {topArticles.map((a) => (
                        <Row
                            key={a.id}
                            title={a.name}
                            subtitle={`${a.total_quantity} unité(s)`}
                            value={formatCurrency(a.total_revenue)}
                        />
                    ))}
                </Section>

                {/* Récentes */}
                <Section title="Ventes récentes" empty={recent.length === 0} emptyText="Aucune vente récente.">
                    {recent.map((s) => (
                        <Row
                            key={s.id}
                            title={s.reference}
                            subtitle={`${s.user_name ?? s.customer_name ?? 'Client'} · ${formatDate(s.created_at)}`}
                            value={formatCurrency(s.total_amount)}
                            valueColor={P.emerald}
                        />
                    ))}
                </Section>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatCard({ label, value, color = P.fg }: { label: string; value: string; color?: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

function Section({
    title,
    empty,
    emptyText,
    children,
}: {
    title: string;
    empty: boolean;
    emptyText: string;
    children?: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent>
                <Text style={styles.h2}>{title}</Text>
                <View style={{ gap: 8, marginTop: 12 }}>
                    {empty ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.muted}>{emptyText}</Text>
                        </View>
                    ) : (
                        children
                    )}
                </View>
            </CardContent>
        </Card>
    );
}

function Row({
    title,
    subtitle,
    value,
    valueColor = P.fg,
}: {
    title: string;
    subtitle: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <View style={styles.row}>
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>
            <Text style={[styles.rowValue, { color: valueColor }]} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

function formatDate(v?: string | null): string {
    if (!v) return '-';
    const d = new Date(v.replace(' ', 'T'));
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 14, paddingBottom: 40 },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    h2: { fontSize: 17, fontWeight: '700', color: P.fg },
    muted: { fontSize: 13, color: P.muted, textAlign: 'center' },

    statsGrid: { flexDirection: 'row', gap: 10 },
    statCard: {
        flex: 1,
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
        gap: 4,
    },
    statLabel: { fontSize: 12, color: P.muted },
    statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: P.border,
    },
    rowTitle: { fontSize: 14, fontWeight: '600', color: P.fg },
    rowSub: { fontSize: 12, color: P.muted, marginTop: 2 },
    rowValue: { fontSize: 14, fontWeight: '700' },

    emptyBox: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: P.border,
    },
});