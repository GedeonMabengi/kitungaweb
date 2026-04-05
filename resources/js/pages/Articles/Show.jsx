import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useOrganizationCurrency } from '@/lib/currency';
import articleRoutes from '@/routes/articles';

export default function ArticleShow({ article, movements, salesStats }) {
    const { formatCurrency } = useOrganizationCurrency();
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Article</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {article.name}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Vue detaillee de la fiche article, du stock et des
                            derniers mouvements associes.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={articleRoutes.edit(article.id)}
                            className="app-button-accent"
                        >
                            Modifier
                        </Link>
                        <Link
                            href={articleRoutes.index()}
                            className="app-button-secondary"
                        >
                            Retour
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={article.name} />

            <div className="space-y-6">
                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Prix</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {formatCurrency(article.price)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Stock actuel</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {article.current_stock}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">
                            Chiffre d'affaires
                        </p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {formatCurrency(salesStats.total_revenue)}
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="app-card space-y-4">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                Informations
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-slate-950">
                                Fiche produit
                            </h2>
                        </div>

                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-slate-500">
                                    Categorie
                                </dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {article.category?.name || 'Sans categorie'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">SKU</dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {article.sku || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">
                                    Code-barres
                                </dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {article.barcode || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">Type</dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {article.unit_type}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">
                                    Seuil d'alerte
                                </dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {article.alert_threshold}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">
                                    Total vendu
                                </dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {salesStats.total_sold}
                                </dd>
                            </div>
                        </dl>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm leading-7 text-slate-600">
                                {article.description ||
                                    'Aucune description enregistree.'}
                            </p>
                        </div>
                    </div>

                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Derniers mouvements
                        </h2>
                        <div className="mt-5 space-y-3">
                            {movements.length > 0 ? (
                                movements.map((movement) => (
                                    <div
                                        key={movement.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {movement.movement_type}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {movement.reason ||
                                                        'Sans motif'}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {movement.user?.name || '-'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-950">
                                                    {movement.quantity}{' '}
                                                    {movement.quantity_type}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {movement.stock_before} -
                                                    {'>'} {movement.stock_after}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucun mouvement de stock sur cet article.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
