// src/screens/reports/ReportsCashScreen.tsx
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useCashReport } from '../../hooks/useReports';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { defaultRange, type DailyCashSummary } from '../../data/types/reports';

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

export default function ReportsCashScreen() {
    const { formatCurrency } = useOrganizationCurrency();
    const [start, setStart] = React.useState(DEF.start_date);
    const [end, setEnd] = React.useState(DEF.end_date);

    const { totals, daily, loading, setFilters } = useCashReport({
        start_date: DEF.start_date,
        end_date: DEF.end_date,
    });

    const apply = () => setFilters({ start_date: start, end_date: end });

    if (loading) {
        return (
            <ScrollView contentContainerStyle={styles.content}>
                <Skeleton height={80} borderRadius={12} />
                <Skeleton height={140} borderRadius={12} />
            </ScrollView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Badge variant="secondary">Rapports caisse</Badge>
                    <Text style={styles.h1}>Flux et clôtures de caisse</Text>
                </View>

                <View style={{ gap: 8 }}>
                    <Input value={start} onChangeText={setStart} placeholder="Du (YYYY-MM-DD)" autoCapitalize="none" />
                    <Input value={end} onChangeText={setEnd} placeholder="Au (YYYY-MM-DD)" autoCapitalize="none" />
                    <Button onPress={apply}>Actualiser</Button>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard label="Ouverture" value={formatCurrency(totals.opening)} />
                    <StatCard label="Entrées" value={formatCurrency(totals.inputs)} color={P.emerald} />
                </View>
                <View style={styles.statsGrid}>
                    <StatCard label="Sorties" value={formatCurrency(totals.outputs)} color={P.rose} />
                    <StatCard label="Écart cumulé" value={formatCurrency(totals.difference)} color={P.amber} />
                </View>

                <Card>
                    <CardContent>
                        <Text style={styles.h2}>Historique des caisses</Text>
                        <View style={{ gap: 8, marginTop: 12 }}>
                            {daily.length === 0 ? (
                                <Empty text="Aucune caisse sur la période." />
                            ) : (
                                daily.map((r) => <CashRow key={r.id} row={r} formatCurrency={formatCurrency} />)
                            )}
                        </View>
                    </CardContent>
                </Card>
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

function CashRow({ row, formatCurrency }: { row: DailyCashSummary; formatCurrency: (n: number) => string }) {
    return (
        <View style={styles.cashRow}>
            <View style={styles.cashTop}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cashTitle}>{row.date}</Text>
                    <Text style={styles.cashSub}>
                        {row.user_name ?? 'Utilisateur'}
                    </Text>
                </View>
                <Badge variant={row.status === 'OPEN' ? 'default' : 'secondary'}>
                    {row.status === 'OPEN' ? 'Ouverte' : 'Clôturée'}
                </Badge>
            </View>
            <View style={styles.cashCells}>
                <Cell label="Ouv." value={formatCurrency(row.opening_balance)} />
                <Cell label="Entrées" value={formatCurrency(row.total_input)} color={P.emerald} />
                <Cell label="Sorties" value={formatCurrency(row.total_output)} color={P.rose} />
                <Cell
                    label="Écart"
                    value={row.difference != null ? formatCurrency(row.difference) : '-'}
                />
            </View>
        </View>
    );
}

function Cell({ label, value, color = P.fg }: { label: string; value: string; color?: string }) {
    return (
        <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.cellLabel}>{label}</Text>
            <Text style={[styles.cellValue, { color }]} numberOfLines={1}>{value}</Text>
        </View>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <View style={styles.emptyBox}>
            <Text style={styles.muted}>{text}</Text>
        </View>
    );
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

    cashRow: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: P.border,
        gap: 10,
    },
    cashTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cashTitle: { fontSize: 14, fontWeight: '700', color: P.fg },
    cashSub: { fontSize: 12, color: P.muted, marginTop: 2 },
    cashCells: { flexDirection: 'row', gap: 8 },
    cellLabel: { fontSize: 11, color: P.muted, textTransform: 'uppercase' },
    cellValue: { fontSize: 13, fontWeight: '700' },

    emptyBox: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: P.border,
    },
});