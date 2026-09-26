// src/screens/reports/ReportsStockScreen.tsx
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useStockReport } from '../../hooks/useReports';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { defaultRange } from '../../data/types/reports';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    emerald: '#047857',
    rose: '#B91C1C',
    amber: '#B45309',
};

const DEF = defaultRange();

export default function ReportsStockScreen() {
    const { formatCurrency } = useOrganizationCurrency();
    const [start, setStart] = React.useState(DEF.start_date);
    const [end, setEnd] = React.useState(DEF.end_date);

    const {
        totals,
        lowStock,
        expiring,
        expired,
        summary,
        recent,
        loading,
        setFilters,
    } = useStockReport({ start_date: DEF.start_date, end_date: DEF.end_date });

    const apply = () => setFilters({ start_date: start, end_date: end });

    if (loading) {
        return (
            <ScrollView contentContainerStyle={styles.content}>
                <Skeleton height={80} borderRadius={12} />
                <Skeleton height={140} borderRadius={12} />
                <Skeleton height={200} borderRadius={12} />
            </ScrollView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Badge variant="secondary">Rapports stock</Badge>
                    <Text style={styles.h1}>Suivi des stocks et alertes</Text>
                </View>

                <View style={{ gap: 8 }}>
                    <Input value={start} onChangeText={setStart} placeholder="Du (YYYY-MM-DD)" autoCapitalize="none" />
                    <Input value={end} onChangeText={setEnd} placeholder="Au (YYYY-MM-DD)" autoCapitalize="none" />
                    <Button onPress={apply}>Actualiser</Button>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard label="Valeur stock" value={formatCurrency(totals.stockValue)} />
                    <StatCard label="Stock faible" value={String(totals.lowStockCount)} color={P.amber} />
                </View>
                <View style={styles.statsGrid}>
                    <StatCard label="Expire bientôt" value={String(totals.expiringSoonCount)} />
                    <StatCard label="Déjà expirés" value={String(totals.expiredCount)} color={P.rose} />
                </View>

                <Section title="Synthèse des mouvements" empty={summary.length === 0} emptyText="Aucun mouvement sur la période.">
                    {summary.map((s) => (
                        <Row
                            key={s.movement_type}
                            title={s.movement_type}
                            subtitle={`${s.count} mouvement(s)`}
                            value={String(s.total_quantity)}
                        />
                    ))}
                </Section>

                <Section title="Mouvements récents" empty={recent.length === 0} emptyText="Aucun mouvement récent.">
                    {recent.map((m) => (
                        <Row
                            key={m.id}
                            title={m.article_name ?? 'Article'}
                            subtitle={`${m.user_name ?? 'Système'} · ${formatDate(m.created_at)}`}
                            value={`${m.movement_type} ${m.quantity}`}
                        />
                    ))}
                </Section>

                <Section title="Stock faible" empty={lowStock.length === 0} emptyText="Aucun article critique.">
                    {lowStock.map((a) => (
                        <Row
                            key={a.id}
                            title={a.name}
                            subtitle={`Stock ${a.current_stock} / Seuil ${a.alert_threshold}`}
                            value={String(a.current_stock)}
                            valueColor={P.amber}
                        />
                    ))}
                </Section>

                <Section title="Expiration proche" empty={expiring.length === 0} emptyText="Aucune péremption proche.">
                    {expiring.map((a) => (
                        <Row
                            key={a.id}
                            title={a.name}
                            subtitle={`Expire le ${formatDate(a.expiration_date)}`}
                            value={String(a.current_stock)}
                        />
                    ))}
                </Section>

                <Section title="Articles expirés" empty={expired.length === 0} emptyText="Aucun article expiré.">
                    {expired.map((a) => (
                        <Row
                            key={a.id}
                            title={a.name}
                            subtitle={`Expiré le ${formatDate(a.expiration_date)}`}
                            value={String(a.current_stock)}
                            valueColor={P.rose}
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
            <Text style={[styles.statValue, { color }]} numberOfLines={1}>{value}</Text>
        </View>
    );
}

function Section({ title, empty, emptyText, children }: { title: string; empty: boolean; emptyText: string; children?: React.ReactNode }) {
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

function Row({ title, subtitle, value, valueColor = P.fg }: { title: string; subtitle: string; value: string; valueColor?: string }) {
    return (
        <View style={styles.row}>
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>{subtitle}</Text>
            </View>
            <Text style={[styles.rowValue, { color: valueColor }]} numberOfLines={1}>{value}</Text>
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
    statValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },

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