// src/screens/dashboard/DashboardScreen.tsx
import * as React from 'react';
import {
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    AlertTriangle,
    ArrowRight,
    CalendarClock,
    CreditCard,
    Package,
    RefreshCcw,
    ShoppingBag,
    Wallet,
} from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Separator } from '../../components/ui/Separator';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDashboard } from '../../hooks/useDashboard';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { useSessionStore } from '../../store/session.store';
import { useAuthorization } from '../../lib/authorization';
import { MOVEMENT_TYPE_LABELS } from '../../data/types/stock';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    dark: '#0F172A',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

// -------------------------------------------------------------
// Écran
// -------------------------------------------------------------
export default function DashboardScreen() {
    const navigation = useNavigation<Nav>();
    const user = useSessionStore((s) => s.user);
    const { hasPermission } = useAuthorization();
    const { formatCurrency } = useOrganizationCurrency();

    const {
        stats,
        recentSales,
        recentMovements,
        expiringArticles,
        openRegister,
        loading,
        refreshing,
        refresh,
    } = useDashboard();

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );

    // Rôles (depuis session mock)
    const roles = user?.roles?.map((r) => r.name) ?? [];
    const isAdmin = roles.includes('admin');
    const isStockManager = roles.includes('gestionnaire_stock');
    const isSeller = roles.includes('vendeur');
    const isCashier = roles.includes('caissier');

    const canCreateSales =
        hasPermission('sales.create') && (isAdmin || isSeller);
    const canViewArticles = hasPermission('articles.view');
    const canViewCash = hasPermission('cash.view') && !isSeller;

    const currentBalance =
        Number(openRegister?.opening_balance ?? 0) +
        Number(openRegister?.total_input ?? 0) -
        Number(openRegister?.total_output ?? 0);

    if (loading && !refreshing) {
        return (
            <ScrollView contentContainerStyle={styles.content}>
                <Skeleton height={180} borderRadius={16} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Skeleton height={100} borderRadius={12} style={{ flex: 1 }} />
                    <Skeleton height={100} borderRadius={12} style={{ flex: 1 }} />
                </View>
                <Skeleton height={200} borderRadius={12} />
                <Skeleton height={200} borderRadius={12} />
            </ScrollView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* HERO */}
                <View style={styles.hero}>
                    <Badge variant="secondary">Tableau de bord</Badge>
                    <Text style={styles.heroGreeting}>Bonjour</Text>
                    <Text style={styles.heroName}>{user?.name ?? 'Utilisateur'}</Text>
                    <Text style={styles.heroSubtitle}>
                        {isAdmin
                            ? 'Vous pilotez l’ensemble du système avec une vision transversale.'
                            : isStockManager
                              ? 'Votre priorité : surveiller le stock et les péremptions.'
                              : isSeller
                                ? 'Accès orienté ventes pour la caisse et le point de vente.'
                                : 'Suivi de la caisse et des flux financiers.'}
                    </Text>

                    <View style={styles.rolesRow}>
                        {roles.map((role) => (
                            <Badge key={role} variant="outline">
                                {roleLabel(role)}
                            </Badge>
                        ))}
                    </View>

                    {/* Résumé selon rôle */}
                    <View style={styles.heroCards}>
                        {isAdmin || isSeller ? (
                            <>
                                <View style={[styles.heroCard, styles.heroCardDark]}>
                                    <Text style={styles.heroCardLabelDark}>
                                        Ventes aujourd’hui
                                    </Text>
                                    <Text style={styles.heroCardValueDark}>
                                        {formatCurrency(stats.todaySales)}
                                    </Text>
                                    <Text style={styles.heroCardHintDark}>
                                        {stats.todaySalesCount} transaction(s)
                                    </Text>
                                </View>
                                <View style={[styles.heroCard, styles.heroCardLight]}>
                                    <Text style={styles.heroCardLabel}>
                                        Mois en cours
                                    </Text>
                                    <Text style={styles.heroCardValue}>
                                        {formatCurrency(stats.monthSales)}
                                    </Text>
                                    <Text style={styles.heroCardHint}>
                                        Activité cumulée sur la période
                                    </Text>
                                </View>
                            </>
                        ) : isCashier ? (
                            <>
                                <View style={[styles.heroCard, styles.heroCardDark]}>
                                    <Text style={styles.heroCardLabelDark}>
                                        Caisse du jour
                                    </Text>
                                    <Text style={styles.heroCardValueDark}>
                                        {openRegister ? 'Ouverte' : 'Fermée'}
                                    </Text>
                                    <Text style={styles.heroCardHintDark}>
                                        Partagée par votre organisation
                                    </Text>
                                </View>
                                <View style={[styles.heroCard, styles.heroCardLight]}>
                                    <Text style={styles.heroCardLabel}>
                                        Solde courant
                                    </Text>
                                    <Text style={styles.heroCardValue}>
                                        {formatCurrency(currentBalance)}
                                    </Text>
                                    <Text style={styles.heroCardHint}>
                                        Entrées et sorties
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={[styles.heroCard, styles.heroCardDark]}>
                                    <Text style={styles.heroCardLabelDark}>
                                        Articles suivis
                                    </Text>
                                    <Text style={styles.heroCardValueDark}>
                                        {stats.totalArticles}
                                    </Text>
                                    <Text style={styles.heroCardHintDark}>
                                        Catalogue actif
                                    </Text>
                                </View>
                                <View style={[styles.heroCard, styles.heroCardLight]}>
                                    <Text style={styles.heroCardLabel}>
                                        Alertes stock
                                    </Text>
                                    <Text
                                        style={[
                                            styles.heroCardValue,
                                            { color: '#B45309' },
                                        ]}
                                    >
                                        {stats.lowStockCount}
                                    </Text>
                                    <Text style={styles.heroCardHint}>
                                        À réapprovisionner
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* ACTIONS RAPIDES */}
                <View style={styles.actionsRow}>
                    {canCreateSales ? (
                        <Button
                            onPress={() => navigation.navigate('Main', { screen: 'Sales.POS' } as any)}
                            style={{ flex: 1 }}
                        >
                            Nouvelle vente
                        </Button>
                    ) : null}
                    {canViewArticles ? (
                        <Button
                            variant="outline"
                            onPress={() =>
                                navigation.navigate('Main', { screen: 'Articles.List' } as any)
                            }
                            style={{ flex: 1 }}
                        >
                            Voir le stock
                        </Button>
                    ) : null}
                    {canViewCash ? (
                        <Button
                            variant="outline"
                            onPress={() =>
                                navigation.navigate('Main', { screen: 'Cash.Dashboard' } as any)
                            }
                            style={{ flex: 1 }}
                        >
                            Caisse
                        </Button>
                    ) : null}
                </View>

                {/* METRIQUES */}
                <View style={styles.metricsGrid}>
                    {isAdmin || isStockManager ? (
                        <>
                            <MetricCard
                                icon={<Package size={20} color="#334155" />}
                                label="Articles actifs"
                                value={String(stats.totalArticles)}
                            />
                            <MetricCard
                                icon={<AlertTriangle size={20} color="#B45309" />}
                                label="Stock faible"
                                value={String(stats.lowStockCount)}
                                tone="amber"
                            />
                        </>
                    ) : null}
                    {isAdmin || isSeller ? (
                        <>
                            <MetricCard
                                icon={<ShoppingBag size={20} color="#047857" />}
                                label="Ventes du jour"
                                value={formatCurrency(stats.todaySales)}
                                tone="emerald"
                            />
                            <MetricCard
                                icon={<CreditCard size={20} color="#0369A1" />}
                                label="Ventes du mois"
                                value={formatCurrency(stats.monthSales)}
                                tone="sky"
                            />
                        </>
                    ) : null}
                    {isCashier ? (
                        <>
                            <MetricCard
                                icon={<Wallet size={20} color="#0369A1" />}
                                label="Caisse ouverte"
                                value={openRegister ? 'Oui' : 'Non'}
                                tone="sky"
                            />
                            <MetricCard
                                icon={<RefreshCcw size={20} color="#B45309" />}
                                label="Solde courant"
                                value={formatCurrency(currentBalance)}
                                tone="amber"
                            />
                        </>
                    ) : null}
                </View>

                {/* VENTES RÉCENTES */}
                {(isAdmin || isSeller) && (
                    <Section
                        label="Activité commerciale"
                        title="Ventes récentes"
                        actionLabel="Historique"
                        onAction={() =>
                            navigation.navigate('Main', { screen: 'Sales.List' } as any)
                        }
                        empty={recentSales.length === 0}
                        emptyText="Aucune vente récente à afficher."
                    >
                        {recentSales.map((s) => (
                            <Pressable
                                key={s.id}
                                onPress={() =>
                                    navigation.navigate('Sales.Show', { id: s.id })
                                }
                                style={({ pressed }) => [
                                    styles.row,
                                    pressed && { opacity: 0.9 },
                                ]}
                            >
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={styles.rowTitle}>{s.reference}</Text>
                                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                                        {s.customer_name || s.user_name || 'Client de passage'}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.rowValue}>
                                        {formatCurrency(s.total_amount)}
                                    </Text>
                                    <Text style={styles.rowMeta}>
                                        {formatDate(s.created_at)}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </Section>
                )}

                {/* MOUVEMENTS RÉCENTS */}
                {(isAdmin || isStockManager) && (
                    <Section
                        label="Stock"
                        title="Mouvements récents"
                        actionLabel="Consulter"
                        onAction={() =>
                            navigation.navigate('Main', { screen: 'Stock.Movements' } as any)
                        }
                        empty={recentMovements.length === 0}
                        emptyText="Aucun mouvement récent à afficher."
                    >
                        {recentMovements.map((m) => (
                            <View key={m.id} style={styles.row}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={styles.rowTitle} numberOfLines={1}>
                                        {m.article_name ?? 'Article'}
                                    </Text>
                                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                                        {m.user_name ?? 'Système'} · {formatDate(m.created_at)}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.rowValue}>
                                        {MOVEMENT_TYPE_LABELS[m.movement_type as keyof typeof MOVEMENT_TYPE_LABELS] ?? m.movement_type}
                                    </Text>
                                    <Text style={styles.rowMeta}>
                                        Qté {m.quantity}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </Section>
                )}

                {/* PÉREMPTION */}
                {(isAdmin || isStockManager) && (
                    <Card>
                        <CardContent>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconAmber}>
                                    <CalendarClock size={20} color="#B45309" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.sectionLabelAmber}>Alertes</Text>
                                    <Text style={styles.sectionTitle}>
                                        Péremption à surveiller
                                    </Text>
                                </View>
                            </View>

                            {expiringArticles.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Text style={styles.emptyText}>
                                        Aucun article critique pour le moment.
                                    </Text>
                                </View>
                            ) : (
                                <View style={{ gap: 10, marginTop: 14 }}>
                                    {expiringArticles.map((a) => (
                                        <View key={a.id} style={styles.expiringRow}>
                                            <Text style={styles.rowTitle}>{a.name}</Text>
                                            <Text style={styles.rowSubtitle}>
                                                Expire le {formatDate(a.expiration_date)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* CAISSE (vue caissier) */}
                {isCashier && (
                    <View style={styles.cashCard}>
                        <Text style={styles.cashLabel}>Caisse</Text>
                        <Text style={styles.cashTitle}>État du poste</Text>

                        <View style={styles.cashGrid}>
                            <View style={styles.cashCell}>
                                <Text style={styles.cashCellLabel}>Solde initial</Text>
                                <Text style={styles.cashCellValue}>
                                    {formatCurrency(openRegister?.opening_balance ?? 0)}
                                </Text>
                            </View>
                            <View style={styles.cashCell}>
                                <Text style={styles.cashCellLabel}>Solde courant</Text>
                                <Text style={styles.cashCellValue}>
                                    {formatCurrency(currentBalance)}
                                </Text>
                            </View>
                        </View>

                        <Button
                            onPress={() =>
                                navigation.navigate('Main', { screen: 'Cash.Dashboard' } as any)
                            }
                            style={{ marginTop: 14 }}
                        >
                            Gérer la caisse
                        </Button>
                    </View>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// -------------------------------------------------------------
// Sous-composants
// -------------------------------------------------------------
function MetricCard({
    icon,
    label,
    value,
    tone = 'slate',
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone?: 'slate' | 'amber' | 'emerald' | 'sky';
}) {
    const toneStyle = {
        slate:   { bg: '#F1F5F9' },
        amber:   { bg: '#FEF3C7' },
        emerald: { bg: '#D1FAE5' },
        sky:     { bg: '#E0F2FE' },
    }[tone];

    return (
        <View style={styles.metricCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.metricLabel}>{label}</Text>
                <Text style={styles.metricValue} numberOfLines={1}>
                    {value}
                </Text>
            </View>
            <View style={[styles.metricIcon, { backgroundColor: toneStyle.bg }]}>
                {icon}
            </View>
        </View>
    );
}

function Section({
    label,
    title,
    actionLabel,
    onAction,
    empty,
    emptyText,
    children,
}: {
    label: string;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    empty: boolean;
    emptyText: string;
    children?: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent>
                <View style={styles.sectionHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>{label}</Text>
                        <Text style={styles.sectionTitle}>{title}</Text>
                    </View>
                    {actionLabel && onAction ? (
                        <Pressable
                            onPress={onAction}
                            hitSlop={6}
                            style={({ pressed }) => [
                                styles.sectionAction,
                                pressed && { opacity: 0.7 },
                            ]}
                        >
                            <Text style={styles.sectionActionText}>{actionLabel}</Text>
                            <ArrowRight size={14} color={P.muted} />
                        </Pressable>
                    ) : null}
                </View>

                <View style={{ gap: 10, marginTop: 14 }}>
                    {empty ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>{emptyText}</Text>
                        </View>
                    ) : (
                        children
                    )}
                </View>
            </CardContent>
        </Card>
    );
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function formatDate(value?: string | null): string {
    if (!value) return '-';
    const d = new Date(value.replace(' ', 'T'));
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function roleLabel(role: string): string {
    const map: Record<string, string> = {
        admin: 'Administrateur',
        gestionnaire_stock: 'Gestionnaire stock',
        vendeur: 'Vendeur',
        caissier: 'Caissier',
    };
    return map[role] ?? role;
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 16, paddingBottom: 40 },

    // HERO
    hero: {
        backgroundColor: P.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: P.border,
        padding: 20,
        gap: 8,
    },
    heroGreeting: {
        fontSize: 12,
        fontWeight: '700',
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4,
    },
    heroName: { fontSize: 26, fontWeight: '800', color: P.fg },
    heroSubtitle: { fontSize: 14, color: P.muted, lineHeight: 20, marginTop: 4 },
    rolesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    heroCards: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    heroCard: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        gap: 4,
    },
    heroCardDark: { backgroundColor: P.dark },
    heroCardLight: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: P.border,
    },
    heroCardLabelDark: { fontSize: 12, color: '#CBD5E1' },
    heroCardValueDark: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 4,
    },
    heroCardHintDark: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    heroCardLabel: { fontSize: 12, color: P.muted },
    heroCardValue: {
        fontSize: 20,
        fontWeight: '800',
        color: P.fg,
        marginTop: 4,
    },
    heroCardHint: { fontSize: 11, color: P.muted, marginTop: 2 },

    // Actions
    actionsRow: { flexDirection: 'row', gap: 8 },

    // Metrics
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    metricCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
        gap: 10,
    },
    metricLabel: { fontSize: 12, color: P.muted },
    metricValue: {
        fontSize: 22,
        fontWeight: '800',
        color: P.fg,
        marginTop: 6,
    },
    metricIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Section
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: P.fg, marginTop: 2 },
    sectionLabelAmber: {
        fontSize: 11,
        color: '#B45309',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F4F4F5',
    },
    sectionActionText: { fontSize: 12, color: P.muted, fontWeight: '500' },
    sectionIconAmber: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Rows
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: P.border,
    },
    rowTitle: { fontSize: 14, fontWeight: '600', color: P.fg },
    rowSubtitle: { fontSize: 12, color: P.muted, marginTop: 2 },
    rowValue: { fontSize: 14, fontWeight: '700', color: P.fg },
    rowMeta: { fontSize: 12, color: P.muted, marginTop: 2 },

    // Expiring
    expiringRow: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },

    // Empty
    emptyBox: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: P.border,
        alignItems: 'center',
    },
    emptyText: { color: P.muted, fontSize: 13, textAlign: 'center' },

    // Cash
    cashCard: {
        backgroundColor: P.dark,
        borderRadius: 16,
        padding: 20,
        gap: 6,
    },
    cashLabel: {
        fontSize: 11,
        color: '#5EEAD4',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontWeight: '700',
    },
    cashTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
    cashGrid: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    cashCell: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 12,
        gap: 4,
    },
    cashCellLabel: { fontSize: 12, color: '#CBD5E1' },
    cashCellValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 4,
    },
});