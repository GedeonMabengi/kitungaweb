import { Head } from '@inertiajs/react';
import CategoryForm from './CategoryForm';

export default function CategoryEdit({ category }) {
    return (
        <>
            <Head title={`Modifier ${category.name}`} />
            <CategoryForm category={category} mode="edit" />
        </>
    );
}
