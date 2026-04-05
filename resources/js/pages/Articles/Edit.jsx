import { Head } from '@inertiajs/react';
import ArticleForm from './ArticleForm';

export default function ArticleEdit({ article, categories }) {
    return (
        <>
            <Head title={`Modifier ${article.name}`} />
            <ArticleForm
                article={article}
                categories={categories}
                mode="edit"
            />
        </>
    );
}
