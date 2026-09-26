// src/screens/articles/ArticleEditScreen.tsx
import * as React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import ArticleForm from './ArticleForm';
import { ArticlesRepo } from '../../data/repositories/articles.repo';
import type { ArticleRow } from '../../data/types/article';
import type { RootStackParamList } from '../../navigation/types';

type Route = RouteProp<RootStackParamList, 'Articles.Edit'>;

export default function ArticleEditScreen() {
    const route = useRoute<Route>();
    const { id } = route.params;

    const [article, setArticle] = React.useState<ArticleRow | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const row = await ArticlesRepo.find(id);
            setArticle(row);
            setLoading(false);
        })();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={styles.text}>Chargement…</Text>
            </View>
        );
    }

    if (!article) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Article introuvable.</Text>
            </View>
        );
    }

    return <ArticleForm mode="edit" article={article} />;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
        backgroundColor: '#FAFAFA',
    },
    text: { color: '#71717A' },
});