// src/screens/categories/CategoryShowScreen.tsx
import * as React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pencil } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Separator } from '../../components/ui/Separator';
import {
    CategoriesRepo,
    type CategoryWithCount,
} from '../../data/repositories/categories.repo';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    card: '#FFFFFF',
    subtle: '#F9FAFB',
};

type Route = RouteProp<RootStackParamList, 'Categories.Show'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CategoryShowScreen() {
    const { id } = useRoute<Route>().params;
    const navigation = useNavigation<Nav>();

    const [category, setCategory] = React.useState<CategoryWithCount | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const row = await CategoriesRepo.findWithCount(id);
            setCategory(row);
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

    if (!category) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Catégorie introuvable.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={{ gap: 10 }}>
                <Badge variant="secondary">Catégorie</Badge>
                <Text style={styles.h1}>{category.name}</Text>
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                    {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <Button
                        onPress={() =>
                            navigation.navigate('Categories.Edit', { id: category.id })
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

            <Card>
                <CardContent>
                    <Text style={styles.sectionLabel}>Informations</Text>
                    <Text style={styles.h2}>Détail de la catégorie</Text>

                    <Separator style={{ marginVertical: 14 }} />

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Articles associés</Text>
                        <Text style={styles.fieldValue}>
                            {category.articles_count}
                        </Text>
                    </View>

                    <View style={[styles.field, { marginTop: 14 }]}>
                        <Text style={styles.fieldLabel}>Description</Text>
                        <View style={styles.descBox}>
                            <Text style={styles.muted}>
                                {category.description || 'Aucune description.'}
                            </Text>
                        </View>
                    </View>
                </CardContent>
            </Card>
        </ScrollView>
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
    sectionLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    field: {},
    fieldLabel: { fontSize: 12, color: P.muted },
    fieldValue: { fontSize: 15, fontWeight: '600', color: P.fg, marginTop: 2 },
    descBox: {
        backgroundColor: P.subtle,
        padding: 12,
        borderRadius: 10,
        marginTop: 6,
    },
});