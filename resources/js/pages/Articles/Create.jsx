import { Head } from '@inertiajs/react';
import ArticleForm from './ArticleForm';

export default function ArticleCreate({ categories }) {
    return (
        <>
            <Head title="Nouvel article" />
            <ArticleForm categories={categories} mode="create" />
        </>
    );
}
