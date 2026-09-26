// src/screens/categories/CategoryEditScreen.tsx
import * as React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import CategoryForm from './CategoryForm';
import { CategoriesRepo } from '../../data/repositories/categories.repo';
import type { Category } from '../../data/types/category';
import type { RootStackParamList } from '../../navigation/types';

type Route = RouteProp<RootStackParamList, 'Categories.Edit'>;

export default function CategoryEditScreen() {
    const { id } = useRoute<Route>().params;
    const [category, setCategory] = React.useState<Category | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const row = await CategoriesRepo.find(id);
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
                <Text style={styles.text}>Catégorie introuvable.</Text>
            </View>
        );
    }

    return <CategoryForm mode="edit" category={category} />;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#FAFAFA',
    },
    text: { color: '#71717A' },
});