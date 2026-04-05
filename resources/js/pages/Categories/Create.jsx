import { Head } from '@inertiajs/react';
import CategoryForm from './CategoryForm';

export default function CategoryCreate() {
    return (
        <>
            <Head title="Nouvelle categorie" />
            <CategoryForm mode="create" />
        </>
    );
}
