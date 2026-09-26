// src/screens/categories/CategoriesListScreen.tsx
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
import {
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react-native';

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
import { useCategoriesList } from '../../hooks/useCategories';
import { useAuthorization } from '../../lib/authorization';
import { CategoriesRepo, type CategoryWithCount } from '../../data/repositories/categories.repo';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriesListScreen() {
    const navigation = useNavigation<Nav>();
    const { hasPermission } = useAuthorization();
    const canCreate = hasPermission('categories.create');
    const canEdit = hasPermission('categories.edit');
    const canDelete = hasPermission('categories.delete');
    const canManage = canEdit || canDelete;

    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState<'' | '1' | '0'>('');
    const [actionCategory, setActionCategory] =
        React.useState<CategoryWithCount | null>(null);

    const { data, loading, refreshing, setFilters, refresh } = useCategoriesList();

    // Debounce
    React.useEffect(() => {
        const t = setTimeout(() => {
            setFilters({ search, status });
        }, 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status]);

    // Refresh au focus
    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );

    const confirmDelete = (category: CategoryWithCount) => {
        const run = async () => {
            const count = await CategoriesRepo.articlesCount(category.id);
            if (count > 0) {
                Alert.alert(
                    'Impossible',
                    `Cette catégorie contient ${count} article(s). Réaffecte-les d’abord.`,
                );
                return;
            }
            Alert.alert(
                'Supprimer la catégorie',
                `Voulez-vous vraiment supprimer « ${category.name} » ?`,
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: async () => {
                            await CategoriesRepo.softDelete(category.id);
                            refresh();
                        },
                    },
                ],
            );
        };
        run();
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
                            <Badge variant="secondary">Catégories</Badge>
                            <Text style={styles.h1}>
                                Pilotage du catalogue par famille
                            </Text>
                            <Text style={styles.subtitle}>
                                Consulte les catégories actives et leur volume d’articles.
                            </Text>
                        </View>

                        <Input
                            placeholder="Rechercher une catégorie…"
                            value={search}
                            onChangeText={setSearch}
                            autoCapitalize="none"
                        />

                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as '' | '1' | '0')}
                            placeholder="Tous les statuts"
                            title="Statut"
                            options={[
                                { label: 'Tous les statuts', value: '' },
                                { label: 'Actives', value: '1' },
                                { label: 'Inactives', value: '0' },
                            ]}
                        />

                        {canCreate ? (
                            <Button
                                onPress={() => navigation.navigate('Categories.Create')}
                                leftIcon={<Plus size={16} color="#FAFAFA" />}
                            >
                                Nouvelle catégorie
                            </Button>
                        ) : null}
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                            navigation.navigate('Categories.Show', { id: item.id })
                        }
                        onLongPress={
                            canManage ? () => setActionCategory(item) : undefined
                        }
                        delayLongPress={300}
                        style={({ pressed }) => [
                            styles.card,
                            pressed && { opacity: 0.9 },
                        ]}
                    >
                        <View style={styles.cardTop}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text style={styles.cardSubtitle} numberOfLines={2}>
                                    {item.description || 'Aucune description disponible.'}
                                </Text>
                            </View>
                            <View style={styles.iconBox}>
                                <FolderOpen size={20} color={P.fg} />
                            </View>
                        </View>

                        <View style={styles.cardBottom}>
                            <View>
                                <Text style={styles.cellLabel}>Articles</Text>
                                <Text style={styles.cellValue}>
                                    {item.articles_count}
                                </Text>
                            </View>
                            <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                {item.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    loading ? (
                        <View style={{ gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={130} borderRadius={12} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>
                                Aucune catégorie ne correspond aux filtres.
                            </Text>
                        </View>
                    )
                }
            />

            {/* Actions */}
            <BottomSheet
                visible={!!actionCategory}
                onClose={() => setActionCategory(null)}
                maxHeightRatio={0.5}
            >
                <BottomSheetHeader>
                    <BottomSheetTitle>{actionCategory?.name}</BottomSheetTitle>
                </BottomSheetHeader>
                <BottomSheetBody>
                    <Button
                        variant="outline"
                        onPress={() => {
                            const c = actionCategory;
                            setActionCategory(null);
                            if (c) navigation.navigate('Categories.Show', { id: c.id });
                        }}
                    >
                        Voir le détail
                    </Button>
                    {canEdit ? (
                        <Button
                            variant="outline"
                            leftIcon={<Pencil size={16} color="#18181B" />}
                            onPress={() => {
                                const c = actionCategory;
                                setActionCategory(null);
                                if (c) navigation.navigate('Categories.Edit', { id: c.id });
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
                                const c = actionCategory;
                                setActionCategory(null);
                                if (c) confirmDelete(c);
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

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 12, paddingBottom: 40 },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    subtitle: { fontSize: 14, color: P.muted },

    card: {
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
        gap: 14,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: P.fg },
    cardSubtitle: { fontSize: 13, color: P.muted, marginTop: 2 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F4F4F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 10,
    },
    cellLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    cellValue: { fontSize: 14, fontWeight: '700', color: P.fg, marginTop: 2 },
    empty: { padding: 40, alignItems: 'center' },
    emptyText: { color: P.muted, fontSize: 14 },
});