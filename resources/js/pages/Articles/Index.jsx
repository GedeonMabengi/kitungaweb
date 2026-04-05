import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    Filter,
    PackagePlus,
    Pencil,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import { useAuthorization } from '@/lib/authorization';
import { useOrganizationCurrency } from '@/lib/currency';
import articleRoutes from '@/routes/articles';

function stockBadge(article) {
    if (Number(article.current_stock) <= 0) {
        return 'bg-rose-100 text-rose-700';
    }

    if (Number(article.current_stock) <= Number(article.alert_threshold)) {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-emerald-100 text-emerald-700';
}

function stockLabel(article) {
    if (Number(article.current_stock) <= 0) {
        return 'Rupture';
    }

    if (Number(article.current_stock) <= Number(article.alert_threshold)) {
        return 'Stock faible';
    }

    return 'Disponible';
}

export default function ArticlesIndex({ articles, categories, filters }) {
    const { formatCurrency } = useOrganizationCurrency();
    const { hasPermission } = useAuthorization();
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');
    const canCreate = hasPermission('articles.create');
    const canEdit = hasPermission('articles.edit');
    const canDelete = hasPermission('articles.delete');
    const canManageArticles = canEdit || canDelete;

    const handleSearch = (event) => {
        event.preventDefault();

        router.get(
            articleRoutes.index.url(),
            {
                search,
                category_id: categoryId,
                stock_status: stockStatus,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleReset = () => {
        setSearch('');
        setCategoryId('');
        setStockStatus('');
        router.get(
            articleRoutes.index.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (article) => {
        if (window.confirm(`Supprimer ${article.name} ?`)) {
            router.delete(articleRoutes.destroy.url(article.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Catalogue</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Articles et niveau de stock
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Filtre rapidement le catalogue, surveille les seuils
                            critiques et garde un acces direct aux actions de
                            gestion.
                        </p>
                    </div>
                    {canCreate ? (
                        <Link
                            href={articleRoutes.create()}
                            className="app-button-accent"
                        >
                            <PackagePlus className="mr-2 h-4 w-4" />
                            Nouvel article
                        </Link>
                    ) : null}
                </div>
            }
        >
            <Head title="Articles" />

            <div className="space-y-6">
                <section className="app-card">
                    <form
                        onSubmit={handleSearch}
                        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
                    >
                        <label className="relative z-10 block min-w-0">
                            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Nom, SKU, code-barres..."
                                className="app-input relative z-10 pl-11"
                            />
                        </label>

                        <select
                            value={categoryId}
                            onChange={(event) =>
                                setCategoryId(event.target.value)
                            }
                            className="app-select"
                        >
                            <option value="">Toutes categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={stockStatus}
                            onChange={(event) =>
                                setStockStatus(event.target.value)
                            }
                            className="app-select"
                        >
                            <option value="">Tout le stock</option>
                            <option value="ok">Disponible</option>
                            <option value="low">Stock faible</option>
                            <option value="out">Rupture</option>
                        </select>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="app-button-primary w-full"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filtrer
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="app-button-secondary"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </section>

                <section className="space-y-4 lg:hidden">
                    {articles.data.map((article) => (
                        <article key={article.id} className="app-card">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-bold text-slate-950">
                                        {article.name}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {article.category?.name ||
                                            'Sans categorie'}{' '}
                                        � {article.sku}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${stockBadge(article)}`}
                                >
                                    {stockLabel(article)}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="app-card-muted">
                                    <p className="text-xs tracking-wide text-slate-400 uppercase">
                                        Prix
                                    </p>
                                    <p className="mt-2 font-bold text-slate-950">
                                        {formatCurrency(article.price)}
                                    </p>
                                </div>
                                <div className="app-card-muted">
                                    <p className="text-xs tracking-wide text-slate-400 uppercase">
                                        Stock
                                    </p>
                                    <p className="mt-2 font-bold text-slate-950">
                                        {article.current_stock}
                                    </p>
                                </div>
                            </div>

                            {canManageArticles ? (
                                <div className="mt-5 flex gap-3">
                                    {canEdit ? (
                                        <Link
                                            href={articleRoutes.edit(
                                                article.id,
                                            )}
                                            className="app-button-secondary flex-1"
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Modifier
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(article)
                                            }
                                            className="app-button-secondary flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Supprimer
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}
                        </article>
                    ))}
                </section>

                <section className="app-card hidden lg:block">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead>
                                <tr className="text-left text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    <th className="px-4 py-4">Article</th>
                                    <th className="px-4 py-4">Categorie</th>
                                    <th className="px-4 py-4">Prix</th>
                                    <th className="px-4 py-4">Type</th>
                                    <th className="px-4 py-4">Stock</th>
                                    <th className="px-4 py-4">Etat</th>
                                    <th className="px-4 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {articles.data.map((article) => (
                                    <tr
                                        key={article.id}
                                        className="transition hover:bg-slate-50/80"
                                    >
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-4">
                                                {article.image ? (
                                                    <img
                                                        src={`/storage/${article.image}`}
                                                        alt={article.name}
                                                        className="h-12 w-12 rounded-2xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-500">
                                                        {article.name?.charAt(
                                                            0,
                                                        )}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-950">
                                                        {article.name}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {article.sku ||
                                                            article.barcode ||
                                                            '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-slate-600">
                                            {article.category?.name ||
                                                'Sans categorie'}
                                        </td>
                                        <td className="px-4 py-5 font-semibold text-slate-950">
                                            {formatCurrency(article.price)}
                                        </td>
                                        <td className="px-4 py-5 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                <ArrowUpDown className="h-3.5 w-3.5" />
                                                {article.unit_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-sm font-semibold text-slate-900">
                                            {article.current_stock}
                                        </td>
                                        <td className="px-4 py-5">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${stockBadge(article)}`}
                                            >
                                                {stockLabel(article)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5">
                                            {canManageArticles ? (
                                                <div className="flex justify-end gap-2">
                                                    {canEdit ? (
                                                        <Link
                                                            href={articleRoutes.edit(
                                                                article.id,
                                                            )}
                                                            className="app-button-secondary px-3 py-2"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    ) : null}
                                                    {canDelete ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    article,
                                                                )
                                                            }
                                                            className="app-button-secondary border-rose-200 px-3 py-2 text-rose-700 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <div className="text-right text-sm text-slate-400">
                                                    Lecture seule
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="app-card">
                    <Pagination links={articles.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
