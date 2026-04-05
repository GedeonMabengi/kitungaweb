import { Head, Link, router } from '@inertiajs/react';
import { ArrowRightLeft, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import { useAuthorization } from '@/lib/authorization';
import stockMovementRoutes from '@/routes/stock/movements';

export default function StockMovementsIndex({
    movements,
    articles,
    filters,
    movementTypes,
}) {
    const { hasPermission } = useAuthorization();
    const [search, setSearch] = useState(filters.search || '');
    const [articleId, setArticleId] = useState(filters.article_id || '');
    const [movementType, setMovementType] = useState(
        filters.movement_type || '',
    );
    const canCreateMovement = hasPermission('stock.movements.create');

    const handleFilter = (event) => {
        event.preventDefault();

        router.get(
            stockMovementRoutes.index.url(),
            {
                search,
                article_id: articleId || undefined,
                movement_type: movementType || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Stock</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Historique des mouvements de stock
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Suis les entrees, sorties, ajustements et ventes par
                            article depuis une vue chronologique unique.
                        </p>
                    </div>
                    {canCreateMovement ? (
                        <Link
                            href={stockMovementRoutes.create()}
                            className="app-button-accent"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Mouvement manuel
                        </Link>
                    ) : null}
                </div>
            }
        >
            <Head title="Mouvements stock" />

            <div className="space-y-6">
                <section className="app-card">
                    <form
                        onSubmit={handleFilter}
                        className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]"
                    >
                        <label className="relative block">
                            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Rechercher un article..."
                                className="app-input pl-11"
                            />
                        </label>

                        <select
                            value={articleId}
                            onChange={(event) =>
                                setArticleId(event.target.value)
                            }
                            className="app-select"
                        >
                            <option value="">Tous les articles</option>
                            {articles.map((article) => (
                                <option key={article.id} value={article.id}>
                                    {article.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={movementType}
                            onChange={(event) =>
                                setMovementType(event.target.value)
                            }
                            className="app-select"
                        >
                            <option value="">Tous les types</option>
                            {Object.entries(movementTypes).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>

                        <button type="submit" className="app-button-primary">
                            Filtrer
                        </button>
                    </form>
                </section>

                <section className="app-card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead>
                                <tr className="text-left text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    <th className="px-4 py-4">Article</th>
                                    <th className="px-4 py-4">Type</th>
                                    <th className="px-4 py-4">Quantite</th>
                                    <th className="px-4 py-4">Avant</th>
                                    <th className="px-4 py-4">Apres</th>
                                    <th className="px-4 py-4">Utilisateur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {movements.data.length > 0 ? (
                                    movements.data.map((movement) => (
                                        <tr key={movement.id}>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                                        <ArrowRightLeft className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-950">
                                                            {movement.article
                                                                ?.name || '-'}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {movement.reason ||
                                                                'Sans motif'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {movementTypes[
                                                    movement.movement_type
                                                ] || movement.movement_type}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                                                {movement.quantity}{' '}
                                                {movement.quantity_type}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {movement.stock_before}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {movement.stock_after}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {movement.user?.name || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            Aucun mouvement de stock trouve.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="app-card">
                    <Pagination links={movements.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
