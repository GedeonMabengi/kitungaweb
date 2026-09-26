// src/screens/articles/ArticleShowScreen.tsx
import * as React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pencil } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Separator } from '../../components/ui/Separator';
import { ArticlesRepo } from '../../data/repositories/articles.repo';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import type { ArticleRow } from '../../data/types/article';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    subtleBg: '#F9FAFB',
};

type Route = RouteProp<RootStackParamList, 'Articles.Show'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

type Movement = {
    id: number;
    movement_type: string;
    quantity: number;
    quantity_type: string;
    stock_before: number;
    stock_after: number;
    reason: string | null;
    created_at: string;
    user_name: string | null;
};

export default function ArticleShowScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation<Nav>();
    const { id } = route.params;
    const { formatCurrency } = useOrganizationCurrency();

    const [article, setArticle] = React.useState<ArticleRow | null>(null);
    const [stats, setStats] = React.useState({ total_sold: 0, total_revenue: 0 });
    const [movements, setMovements] = React.useState<Movement[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            setLoading(true);
            const [a, s, m] = await Promise.all([
                ArticlesRepo.find(id),
                ArticlesRepo.stats(id),
                ArticlesRepo.recentMovements(id, 10),
            ]);
            setArticle(a);
            setStats(s);
            setMovements(m);
            setLoading(false);
        })();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!article) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Article introuvable.</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* En-tête */}
            <View style={{ gap: 10 }}>
                <Badge variant="secondary">Article</Badge>
                <Text style={styles.h1}>{article.name}</Text>
                {article.sku ? (
                    <Text style={styles.muted}>SKU · {article.sku}</Text>
                ) : null}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                        onPress={() =>
                            navigation.navigate('Articles.Edit', { id: article.id })
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
            <View style={styles.statsRow}>
                <StatCard label="Prix" value={formatCurrency(article.price)} />
                <StatCard label="Stock" value={String(article.current_stock)} />
                <StatCard
                    label="CA"
                    value={formatCurrency(stats.total_revenue)}
                />
            </View>

            {/* Fiche produit */}
            <Card>
                <CardContent>
                    <Text style={styles.sectionLabel}>Informations</Text>
                    <Text style={styles.h2}>Fiche produit</Text>

                    <View style={styles.dl}>
                        <Field label="Catégorie" value={article.category_name ?? 'Sans catégorie'} />
                        <Field label="SKU" value={article.sku ?? '-'} />
                        <Field label="Code-barres" value={article.barcode ?? '-'} />
                        <Field label="Type" value={article.unit_type} />
                        <Field label="Seuil d’alerte" value={String(article.alert_threshold)} />
                        <Field label="Total vendu" value={String(stats.total_sold)} />
                    </View>

                    <Separator style={{ marginVertical: 14 }} />

                    <View style={styles.descriptionBox}>
                        <Text style={styles.muted}>
                            {article.description || 'Aucune description enregistrée.'}
                        </Text>
                    </View>
                </CardContent>
            </Card>

            {/* Mouvements */}
            <Card>
                <CardContent>
                    <Text style={styles.h2}>Derniers mouvements</Text>

                    <View style={{ gap: 10, marginTop: 14 }}>
                        {movements.length === 0 ? (
                            <View style={styles.emptyMovements}>
                                <Text style={styles.muted}>
                                    Aucun mouvement de stock sur cet article.
                                </Text>
                            </View>
                        ) : (
                            movements.map((m) => (
                                <View key={m.id} style={styles.movementRow}>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={styles.movementType}>
                                            {m.movement_type}
                                        </Text>
                                        <Text style={styles.muted} numberOfLines={1}>
                                            {m.reason || 'Sans motif'}
                                        </Text>
                                        <Text style={styles.muted} numberOfLines={1}>
                                            {m.user_name ?? '-'}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.movementQty}>
                                            {m.quantity} {m.quantity_type}
                                        </Text>
                                        <Text style={styles.muted}>
                                            {m.stock_before} → {m.stock_after}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </CardContent>
            </Card>
        </ScrollView>
    );
}

// --- Sous-composants ---
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

// --- Styles ---
const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: P.bg,
    },
    content: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
        backgroundColor: P.bg,
    },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    h2: { fontSize: 18, fontWeight: '700', color: P.fg },
    muted: { fontSize: 13, color: P.muted },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 12,
        gap: 6,
    },
    statLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    statValue: { fontSize: 18, fontWeight: '700', color: P.fg },

    // Fiche
    sectionLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    dl: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 14,
        rowGap: 12,
    },
    field: {
        width: '50%',
        paddingRight: 12,
    },
    fieldLabel: { fontSize: 12, color: P.muted },
    fieldValue: {
        fontSize: 14,
        fontWeight: '600',
        color: P.fg,
        marginTop: 2,
    },
    descriptionBox: {
        backgroundColor: P.subtleBg,
        padding: 12,
        borderRadius: 10,
    },

    // Mouvements
    emptyMovements: {
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: P.border,
        alignItems: 'center',
    },
    movementRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: P.border,
        backgroundColor: P.subtleBg,
    },
    movementType: {
        fontSize: 14,
        fontWeight: '600',
        color: P.fg,
        marginBottom: 2,
    },
    movementQty: {
        fontSize: 14,
        fontWeight: '700',
        color: P.fg,
    },
});