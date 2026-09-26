// src/screens/stock/movements/StockMovementsListScreen.tsx
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
import { ArrowRightLeft, ArrowDown, ArrowUp, Plus, Settings2 } from 'lucide-react-native';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useStockMovements } from '../../../hooks/useStockMovements';
import { useArticles } from '../../../hooks/useArticles';
import { useAuthorization } from '../../../lib/authorization';
import {
    MOVEMENT_TYPE_LABELS,
    type StockMovementRow,
    type StockMovementType,
} from '../../../data/types/stock';
import type { RootStackParamList } from '../../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function StockMovementsListScreen() {
    const navigation = useNavigation<Nav>();
    const { hasPermission } = useAuthorization();
    const canCreate = hasPermission('stock.movements.create') || hasPermission('stock.manage');

    const [search, setSearch] = React.useState('');
    const [articleId, setArticleId] = React.useState<number | null>(null);
    const [movementType, setMovementType] = React.useState<StockMovementType | ''>('');

    const { data: articles } = useArticles({ per_page: 200, page: 1 });
    const { data, total, loading, refreshing, setFilters, refresh } = useStockMovements();

    React.useEffect(() => {
        const t = setTimeout(() => {
            setFilters({
                search,
                article_id: articleId,
                movement_type: movementType,
                page: 1,
                per_page: 20,
            });
        }, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, articleId, movementType]);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );

    const handleReset = () => {
        setSearch('');
        setArticleId(null);
        setMovementType('');
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
                            <Badge variant="secondary">Stock</Badge>
                            <Text style={styles.h1}>
                                Historique des mouvements
                            </Text>
                            <Text style={styles.subtitle}>
                                Entrées, sorties, ajustements et ventes par article.
                            </Text>
                        </View>

                        <Input
                            placeholder="Rechercher un article…"
                            value={search}
                            onChangeText={setSearch}
                            autoCapitalize="none"
                        />

                        <Select
                            value={articleId}
                            onValueChange={(v) => setArticleId(v)}
                            placeholder="Tous les articles"
                            title="Article"
                            options={[
                                { label: 'Tous les articles', value: null as any },
                                ...articles.map((a) => ({
                                    label: a.name,
                                    value: a.id,
                                })),
                            ]}
                        />

                        <Select
                            value={movementType}
                            onValueChange={(v) =>
                                setMovementType(v as StockMovementType | '')
                            }
                            placeholder="Tous les types"
                            title="Type de mouvement"
                            options={[
                                { label: 'Tous les types', value: '' },
                                { label: 'Entrée', value: 'IN' },
                                { label: 'Sortie', value: 'OUT' },
                                { label: 'Ajustement', value: 'ADJUSTMENT' },
                                { label: 'Vente', value: 'SALE' },
                                { label: 'Retour', value: 'RETURN' },
                            ]}
                        />

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Button
                                variant="outline"
                                onPress={handleReset}
                                style={{ flex: 1 }}
                            >
                                Réinitialiser
                            </Button>
                            {canCreate ? (
                                <Button
                                    onPress={() =>
                                        navigation.navigate('Stock.MovementCreate')
                                    }
                                    leftIcon={<Plus size={16} color="#FAFAFA" />}
                                    style={{ flex: 1 }}
                                >
                                    Nouveau mouvement
                                </Button>
                            ) : null}
                        </View>

                        <Text style={styles.counter}>
                            {total} mouvement{total > 1 ? 's' : ''}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => <MovementCard movement={item} />}
                ListEmptyComponent={
                    loading ? (
                        <View style={{ gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={100} borderRadius={12} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <ArrowRightLeft size={32} color={P.muted} />
                            <Text style={styles.emptyText}>
                                Aucun mouvement de stock trouvé.
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

// --- Card mouvement --------------------------------------------
function MovementCard({ movement }: { movement: StockMovementRow }) {
    const isIn =
        movement.movement_type === 'IN' || movement.movement_type === 'RETURN';
    const isAdjust = movement.movement_type === 'ADJUSTMENT';
    const Icon = isAdjust ? Settings2 : isIn ? ArrowDown : ArrowUp;

    const iconBg = isAdjust
        ? '#EEF2FF'
        : isIn
          ? '#ECFDF5'
          : '#FEF2F2';
    const iconFg = isAdjust ? '#4338CA' : isIn ? '#047857' : '#B91C1C';

    return (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                    <Icon size={18} color={iconFg} />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {movement.article_name ?? '-'}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {MOVEMENT_TYPE_LABELS[movement.movement_type]}
                        {movement.reason ? ` · ${movement.reason}` : ''}
                    </Text>
                    <Text style={styles.cardMeta} numberOfLines={1}>
                        {movement.user_name ?? '-'} ·{' '}
                        {formatDate(movement.created_at)}
                    </Text>
                </View>

                <Badge variant="outline">
                    {`${movement.quantity} ${movement.quantity_type}`}
                </Badge>
            </View>

            <View style={styles.stockRow}>
                <View style={styles.stockCell}>
                    <Text style={styles.cellLabel}>Avant</Text>
                    <Text style={styles.cellValue}>{movement.stock_before}</Text>
                </View>
                <ArrowRightLeft size={16} color={P.muted} />
                <View style={styles.stockCell}>
                    <Text style={styles.cellLabel}>Après</Text>
                    <Text style={styles.cellValue}>{movement.stock_after}</Text>
                </View>
                {movement.reference ? (
                    <View style={[styles.stockCell, { flex: 2 }]}>
                        <Text style={styles.cellLabel}>Référence</Text>
                        <Text style={styles.cellValue} numberOfLines={1}>
                            {movement.reference}
                        </Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

function formatDate(iso: string): string {
    if (!iso) return '-';
    const d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mn = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mn}`;
}

// --- Styles ----------------------------------------------------
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
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: P.fg },
    cardSubtitle: { fontSize: 13, color: P.fg, marginTop: 2 },
    cardMeta: { fontSize: 12, color: P.muted, marginTop: 2 },

    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 10,
    },
    stockCell: { flex: 1, gap: 2 },
    cellLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    cellValue: { fontSize: 14, fontWeight: '600', color: P.fg },

    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    emptyText: { color: P.muted, fontSize: 14 },
});