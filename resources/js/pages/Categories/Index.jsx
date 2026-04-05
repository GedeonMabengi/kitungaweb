import { Head, Link, router } from '@inertiajs/react';
import { FolderOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import { useAuthorization } from '@/lib/authorization';
import categoryRoutes from '@/routes/categories';

export default function CategoriesIndex({ categories, filters }) {
    const { hasPermission } = useAuthorization();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status ?? '');
    const canCreate = hasPermission('categories.create');
    const canEdit = hasPermission('categories.edit');
    const canDelete = hasPermission('categories.delete');
    const canManageCategories = canEdit || canDelete;

    const handleFilter = (event) => {
        event.preventDefault();

        router.get(
            categoryRoutes.index.url(),
            {
                search,
                status: status === '' ? undefined : status,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = (category) => {
        if (window.confirm(`Supprimer ${category.name} ?`)) {
            router.delete(categoryRoutes.destroy.url(category.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Categories</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Pilotage du catalogue par famille
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Consulte les categories actives, leur volume
                            d&apos;articles et filtre rapidement les familles a
                            surveiller.
                        </p>
                    </div>
                    {canCreate ? (
                        <Link
                            href={categoryRoutes.create()}
                            className="app-button-accent"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle categorie
                        </Link>
                    ) : null}
                </div>
            }
        >
            <Head title="Categories" />

            <div className="space-y-6">
                <section className="app-card">
                    <form
                        onSubmit={handleFilter}
                        className="grid gap-4 lg:grid-cols-[1fr_220px_auto]"
                    >
                        <label className="relative block">
                            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Rechercher une categorie..."
                                className="app-input pl-11"
                            />
                        </label>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="app-select"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="1">Actives</option>
                            <option value="0">Inactives</option>
                        </select>

                        <button type="submit" className="app-button-primary">
                            Filtrer
                        </button>
                    </form>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {categories.data.length > 0 ? (
                        categories.data.map((category) => (
                            <article key={category.id} className="app-card">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-lg font-bold text-slate-950">
                                            {category.name}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {category.description ||
                                                'Aucune description disponible.'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                        <FolderOpen className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                    <div>
                                        <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                                            Articles
                                        </p>
                                        <p className="mt-1 font-bold text-slate-950">
                                            {category.articles_count}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            category.is_active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-200 text-slate-600'
                                        }`}
                                    >
                                        {category.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </div>

                                <div className="mt-5 flex gap-3">
                                    <Link
                                        href={categoryRoutes.show(category.id)}
                                        className="app-button-secondary flex-1"
                                    >
                                        Voir
                                    </Link>
                                    {canEdit ? (
                                        <Link
                                            href={categoryRoutes.edit(
                                                category.id,
                                            )}
                                            className="app-button-secondary px-4"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(category)
                                            }
                                            className="app-button-secondary border-rose-200 px-4 text-rose-700 hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    ) : null}
                                </div>
                                {!canManageCategories ? (
                                    <p className="mt-4 text-sm text-slate-400">
                                        Lecture seule pour ce profil.
                                    </p>
                                ) : null}
                            </article>
                        ))
                    ) : (
                        <div className="app-card md:col-span-2 xl:col-span-3">
                            <p className="text-sm text-slate-500">
                                Aucune categorie ne correspond aux filtres
                                actuels.
                            </p>
                        </div>
                    )}
                </section>

                <div className="app-card">
                    <Pagination links={categories.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
