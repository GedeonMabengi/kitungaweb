// src/screens/articles/ArticlesListScreen.tsx
import * as React from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Package, PackagePlus, Pencil, Plus, Trash2 } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetHeader,
    BottomSheetTitle,
} from '../../components/ui/BottomSheet';
import { useArticles } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { useAuthorization } from '../../lib/authorization';
import { ArticlesRepo } from '../../data/repositories/articles.repo';
import type { ArticleRow, StockStatus } from '../../data/types/article';
import type { RootStackParamList } from '../../navigation/types';
import { ROUTES } from '../../navigation/routes';
import { useFocusEffect } from '@react-navigation/native';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

// --- Helpers de badge (portés du web) ---------------------------
function stockBadgeVariant(article: ArticleRow): 'default' | 'secondary' | 'destructive' | 'outline' {
    const stock = Number(article.current_stock);
    const alert = Number(article.alert_threshold);
    if (stock <= 0) return 'destructive';
    if (stock <= alert) return 'secondary';
    return 'default';
}

function stockLabel(article: ArticleRow): string {
    const stock = Number(article.current_stock);
    const alert = Number(article.alert_threshold);
    if (stock <= 0) return 'Rupture';
    if (stock <= alert) return 'Stock faible';
    return 'Disponible';
}

// --- Écran ------------------------------------------------------
export default function ArticlesListScreen() {
    const navigation = useNavigation<Nav>();
    const { formatCurrency } = useOrganizationCurrency();
    const { hasPermission } = useAuthorization();
    const canCreate = hasPermission('articles.create');
    const canEdit = hasPermission('articles.edit');
    const canDelete = hasPermission('articles.delete');
    const canManage = canEdit || canDelete;

    const [search, setSearch] = React.useState('');
    const [categoryId, setCategoryId] = React.useState<number | null>(null);
    const [stockStatus, setStockStatus] = React.useState<StockStatus | ''>('');

    const [actionArticle, setActionArticle] = React.useState<ArticleRow | null>(null);

    const { data: categories } = useCategories();
    const { data, total, loading, refreshing, filters, setFilters, refresh } = useArticles({

        

        per_page: 20,
        page: 1,
    });

    // Recharge quand l’écran redevient visible
    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );


    // Applique les filtres (debounce simple sur la recherche)
    React.useEffect(() => {
        const t = setTimeout(() => {
            setFilters({
                search,
                category_id: categoryId,
                stock_status: stockStatus,
                page: 1,
                per_page: 20,
            });
        }, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, categoryId, stockStatus]);

    const handleReset = () => {
        setSearch('');
        setCategoryId(null);
        setStockStatus('');
    };

    const confirmDelete = (article: ArticleRow) => {
        Alert.alert(
            'Supprimer l’article',
            `Voulez-vous vraiment supprimer « ${article.name} » ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        await ArticlesRepo.softDelete(article.id);
                        refresh();
                    },
                },
            ],
        );
    };

    const openArticle = (article: ArticleRow) => {
        navigation.navigate('Articles.Show', { id: article.id });
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
                        {/* En-tête */}
                        <View style={styles.header}>
                            <Badge variant="secondary">Catalogue</Badge>
                            <Text style={styles.h1}>Articles et niveau de stock</Text>
                            <Text style={styles.subtitle}>
                                Filtre le catalogue, surveille les seuils critiques.
                            </Text>
                        </View>

                        {/* Filtres */}
                        <View style={{ gap: 10 }}>
                            <Input
                                placeholder="Nom, SKU, code-barres…"
                                value={search}
                                onChangeText={setSearch}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Select
                                value={categoryId}
                                onValueChange={(v) => setCategoryId(v)}
                                placeholder="Toutes catégories"
                                title="Catégorie"
                                options={[
                                    { label: 'Toutes catégories', value: null as any },
                                    ...categories.map((c) => ({
                                        label: c.name,
                                        value: c.id,
                                    })),
                                ]}
                            />

                            <Select
                                value={stockStatus}
                                onValueChange={(v) => setStockStatus(v as StockStatus | '')}
                                placeholder="Tout le stock"
                                title="État du stock"
                                options={[
                                    { label: 'Tout le stock', value: '' },
                                    { label: 'Disponible', value: 'ok' },
                                    { label: 'Stock faible', value: 'low' },
                                    { label: 'Rupture', value: 'out' },
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
                                        onPress={() => navigation.navigate('Articles.Create')}
                                        leftIcon={<PackagePlus size={16} color="#FAFAFA" />}
                                        style={{ flex: 1 }}
                                    >
                                        Nouvel article
                                    </Button>
                                ) : null}
                            </View>
                        </View>

                        {/* Compteur */}
                        <View style={styles.counterRow}>
                            <Text style={styles.counterText}>
                                {total} article{total > 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <ArticleCard
                        article={item}
                        formatCurrency={formatCurrency}
                        onPress={() => openArticle(item)}
                        onLongPress={
                            canManage
                                ? () => setActionArticle(item)
                                : undefined
                        }
                    />
                )}
                ListEmptyComponent={
                    loading ? (
                        <View style={{ gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={110} borderRadius={12} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Package size={32} color={P.muted} />
                            <Text style={styles.emptyText}>Aucun article trouvé</Text>
                        </View>
                    )
                }
            />

            {/* FAB — optionnel si le bouton du header ne suffit pas */}
            {canCreate && data.length > 0 ? (
                <Pressable
                    onPress={() => navigation.navigate('Articles.Create')}
                    style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
                >
                    <Plus size={24} color="#FAFAFA" />
                </Pressable>
            ) : null}

            {/* BottomSheet d’actions */}
            <BottomSheet
                visible={!!actionArticle}
                onClose={() => setActionArticle(null)}
                maxHeightRatio={0.4}
            >
                <BottomSheetHeader>
                    <BottomSheetTitle>{actionArticle?.name}</BottomSheetTitle>
                </BottomSheetHeader>
                <BottomSheetBody>
                    {canEdit ? (
                        <Button
                            variant="outline"
                            leftIcon={<Pencil size={16} color="#18181B" />}
                            onPress={() => {
                                const a = actionArticle;
                                setActionArticle(null);
                                if (a) navigation.navigate('Articles.Edit', { id: a.id });
                            }}
                        >
                            Modifier
                        </Button>
                    ) : null}
                    {canDelete ? (
                        <Button
                            variant="destructive"
                            leftIcon={<Trash2 size={16} color="#FAFAFA" />}
                            onPress={() => {
                                const a = actionArticle;
                                setActionArticle(null);
                                if (a) confirmDelete(a);
                            }}
                        >
                            Supprimer
                        </Button>
                    ) : null}
                </BottomSheetBody>
            </BottomSheet>
        </SafeAreaView>
    );
}

// --- ArticleCard ------------------------------------------------
function ArticleCard({
    article,
    formatCurrency,
    onPress,
    onLongPress,
}: {
    article: ArticleRow;
    formatCurrency: (n: number) => string;
    onPress: () => void;
    onLongPress?: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={300}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
        >
            <View style={styles.cardTop}>
                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {article.name}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {article.category_name ?? 'Sans catégorie'}
                        {article.sku ? ` · ${article.sku}` : ''}
                    </Text>
                </View>
                <Badge variant={stockBadgeVariant(article)}>
                    {stockLabel(article)}
                </Badge>
            </View>

            <View style={styles.cardGrid}>
                <View style={styles.cell}>
                    <Text style={styles.cellLabel}>Prix</Text>
                    <Text style={styles.cellValue}>{formatCurrency(article.price)}</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.cellLabel}>Stock</Text>
                    <Text style={styles.cellValue}>{article.current_stock}</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.cellLabel}>Type</Text>
                    <Text style={styles.cellValue}>{article.unit_type}</Text>
                </View>
            </View>
        </Pressable>
    );
}

// --- Styles -----------------------------------------------------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: {
        padding: 16,
        gap: 12,
        paddingBottom: 100,
    },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    subtitle: { fontSize: 14, color: P.muted },

    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        marginTop: 4,
    },
    counterText: { fontSize: 13, color: P.muted, fontWeight: '500' },

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
    cardTitle: { fontSize: 16, fontWeight: '700', color: P.fg },
    cardSubtitle: { fontSize: 13, color: P.muted, marginTop: 2 },
    cardGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    cell: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 8,
        gap: 4,
    },
    cellLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    cellValue: { fontSize: 14, fontWeight: '700', color: P.fg },

    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    emptyText: { color: P.muted, fontSize: 14 },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#18181B',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
});