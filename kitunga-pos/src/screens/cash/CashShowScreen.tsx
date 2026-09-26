// src/screens/cash/CashShowScreen.tsx
import * as React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { useCashDetail } from '../../hooks/useCash';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { INPUT_SOURCE_LABELS } from '../../data/types/cash';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    emerald: '#047857',
    rose: '#B91C1C',
};

type Route = RouteProp<RootStackParamList, 'Cash.Show'>;

export default function CashShowScreen() {
    const { id } = useRoute<Route>().params;
    const { register, inputs, outputs, loading } = useCashDetail(id);
    const { formatCurrency } = useOrganizationCurrency();

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!register) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Caisse introuvable.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={{ gap: 8 }}>
                <Badge variant="secondary">Caisse</Badge>
                <Text style={styles.h1}>Caisse du {register.date}</Text>
                <Text style={styles.muted}>
                    {register.user_name ?? 'Utilisateur'}
                </Text>
                <Badge variant={register.status === 'OPEN' ? 'default' : 'secondary'}>
                    {register.status === 'OPEN' ? 'Ouverte' : 'Clôturée'}
                </Badge>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
                <StatCard label="Ouverture" value={formatCurrency(register.opening_balance)} />
                <StatCard label="Entrées" value={formatCurrency(register.total_input)} />
                <StatCard label="Sorties" value={formatCurrency(register.total_output)} />
                <StatCard
                    label="Attendu"
                    value={formatCurrency(register.expected_balance)}
                />
            </View>

            {/* Écarts de clôture */}
            {register.status === 'CLOSED' ? (
                <Card>
                    <CardContent>
                        <Text style={styles.h2}>Clôture</Text>
                        <View style={styles.dlRow}>
                            <Text style={styles.dlLabel}>Solde réel</Text>
                            <Text style={styles.dlValue}>
                                {register.actual_balance != null
                                    ? formatCurrency(register.actual_balance)
                                    : '-'}
                            </Text>
                        </View>
                        <View style={styles.dlRow}>
                            <Text style={styles.dlLabel}>Écart</Text>
                            <Text
                                style={[
                                    styles.dlValue,
                                    {
                                        color:
                                            (register.difference ?? 0) === 0
                                                ? P.emerald
                                                : P.rose,
                                    },
                                ]}
                            >
                                {register.difference != null
                                    ? formatCurrency(register.difference)
                                    : '-'}
                            </Text>
                        </View>
                        {register.closing_notes ? (
                            <View style={styles.notesBox}>
                                <Text style={styles.muted}>
                                    {register.closing_notes}
                                </Text>
                            </View>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            {/* Entrées */}
            <Card>
                <CardContent>
                    <Text style={styles.h2}>Entrées de caisse</Text>
                    <View style={{ gap: 8, marginTop: 12 }}>
                        {inputs.length === 0 ? (
                            <EmptyBox text="Aucune entrée enregistrée." />
                        ) : (
                            inputs.map((i) => (
                                <View key={i.id} style={styles.row}>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={styles.rowTitle}>
                                            {INPUT_SOURCE_LABELS[i.source] ?? i.source}
                                        </Text>
                                        <Text style={styles.rowMeta} numberOfLines={1}>
                                            {i.reference || 'Sans référence'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.rowValue, { color: P.emerald }]}>
                                        +{formatCurrency(i.amount)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </CardContent>
            </Card>

            {/* Sorties */}
            <Card>
                <CardContent>
                    <Text style={styles.h2}>Sorties de caisse</Text>
                    <View style={{ gap: 8, marginTop: 12 }}>
                        {outputs.length === 0 ? (
                            <EmptyBox text="Aucune sortie enregistrée." />
                        ) : (
                            outputs.map((o) => (
                                <View key={o.id} style={styles.row}>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={styles.rowTitle}>{o.reason}</Text>
                                        <Text style={styles.rowMeta} numberOfLines={1}>
                                            {o.reference || 'Sans référence'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.rowValue, { color: P.rose }]}>
                                        -{formatCurrency(o.amount)}
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

function EmptyBox({ text }: { text: string }) {
    return (
        <View style={styles.emptyBox}>
            <Text style={styles.muted}>{text}</Text>
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

    dlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    dlLabel: { fontSize: 13, color: P.muted },
    dlValue: { fontSize: 14, fontWeight: '700', color: P.fg },
    notesBox: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },

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
    rowMeta: { fontSize: 12, color: P.muted, marginTop: 2 },
    rowValue: { fontSize: 14, fontWeight: '700' },
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