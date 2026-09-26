// src/screens/reports/ReportsIndexScreen.tsx
import * as React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart3, Boxes, WalletCards } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { useAuthorization } from '../../lib/authorization';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ReportDef = {
    key: 'sales' | 'cash' | 'stock';
    title: string;
    description: string;
    route: keyof RootStackParamList;
    permission: string | string[];
    icon: any;
};

const REPORTS: ReportDef[] = [
    {
        key: 'sales',
        title: 'Rapport des ventes',
        description:
            'Chiffre d’affaires, ventes par jour, top articles et performance vendeurs.',
        route: 'Reports.Sales',
        permission: ['sales.reports', 'reports.view'],
        icon: BarChart3,
    },
    {
        key: 'cash',
        title: 'Rapport de caisse',
        description:
            'Ouvertures, entrées, sorties et écarts de clôture sur la période.',
        route: 'Reports.Cash',
        permission: ['cash.reports', 'reports.view'],
        icon: WalletCards,
    },
    {
        key: 'stock',
        title: 'Rapport de stock',
        description:
            'Valeur du stock, alertes de seuil, péremptions et mouvements.',
        route: 'Reports.Stock',
        permission: ['stock.reports', 'reports.view'],
        icon: Boxes,
    },
];

export default function ReportsIndexScreen() {
    const navigation = useNavigation<Nav>();
    const { hasPermission } = useAuthorization();

    const available = REPORTS.filter((r) => hasPermission(r.permission));

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Badge variant="secondary">Rapports</Badge>
                    <Text style={styles.h1}>Centre de pilotage</Text>
                    <Text style={styles.subtitle}>
                        Accède uniquement aux rapports autorisés pour ton rôle.
                    </Text>
                </View>

                <View style={styles.counterBox}>
                    <Text style={styles.counterLabel}>Accès actifs</Text>
                    <Text style={styles.counterValue}>{available.length}</Text>
                </View>

                <View style={{ gap: 12 }}>
                    {available.map((r) => {
                        const Icon = r.icon;
                        return (
                            <Pressable
                                key={r.key}
                                onPress={() => navigation.navigate(r.route as any)}
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && { opacity: 0.9 },
                                ]}
                            >
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={styles.cardTitle}>{r.title}</Text>
                                    <Text style={styles.cardDesc}>{r.description}</Text>
                                    <Text style={styles.cardCta}>Ouvrir le rapport →</Text>
                                </View>
                                <View style={styles.iconBox}>
                                    <Icon size={20} color={P.fg} />
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 16, paddingBottom: 40 },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    subtitle: { fontSize: 14, color: P.muted },

    counterBox: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 14,
        gap: 4,
    },
    counterLabel: {
        color: '#94A3B8',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    counterValue: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },

    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: P.fg },
    cardDesc: { fontSize: 13, color: P.muted, marginTop: 4, lineHeight: 18 },
    cardCta: {
        fontSize: 13,
        color: P.fg,
        fontWeight: '600',
        marginTop: 10,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F4F4F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
});