import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Archive, Boxes, CalendarClock } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useOrganizationCurrency } from '@/lib/currency';
import reports from '@/routes/reports';

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function ReportsStock({
    lowStockArticles,
    expiringSoon,
    expired,
    stockValue,
    movementsSummary,
    recentMovements,
    filters,
}) {
    const { formatCurrency } = useOrganizationCurrency();

    const submitFilters = (event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        router.get(
            reports.stock.url(),
            {
                start_date: form.get('start_date') || undefined,
                end_date: form.get('end_date') || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Rapports stock</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Suivi des stocks et alertes
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Vision des seuils critiques, peremptions et
                            mouvements sur la periode choisie.
                        </p>
                    </div>
                    <Link
                        href={reports.index()}
                        className="app-button-secondary"
                    >
                        Retour aux rapports
                    </Link>
                </div>
            }
        >
            <Head title="Rapports stock" />

            <div className="space-y-6">
                <form
                    onSubmit={submitFilters}
                    className="app-card grid gap-4 md:grid-cols-3 xl:grid-cols-[220px_220px_auto]"
                >
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        <span>Du</span>
                        <input
                            type="date"
                            name="start_date"
                            defaultValue={filters.start_date}
                            className="app-input"
                        />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        <span>Au</span>
                        <input
                            type="date"
                            name="end_date"
                            defaultValue={filters.end_date}
                            className="app-input"
                        />
                    </label>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="app-button-primary w-full"
                        >
                            Actualiser
                        </button>
                    </div>
                </form>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Valeur du stock
                                </p>
                                <p className="mt-3 text-2xl font-extrabold text-slate-950">
                                    {formatCurrency(stockValue)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <Boxes className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Stock faible
                                </p>
                                <p className="mt-3 text-2xl font-extrabold text-amber-700">
                                    {lowStockArticles.length}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Expire bientot
                                </p>
                                <p className="mt-3 text-2xl font-extrabold text-slate-950">
                                    {expiringSoon.length}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                <CalendarClock className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Deja expires
                                </p>
                                <p className="mt-3 text-2xl font-extrabold text-rose-700">
                                    {expired.length}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                                <Archive className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Synthese des mouvements
                        </h2>
                        <div className="mt-5 space-y-3">
                            {movementsSummary.length ? (
                                movementsSummary.map((item) => (
                                    <div
                                        key={item.movement_type}
                                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {item.movement_type}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {item.count} mouvement(s)
                                            </p>
                                        </div>
                                        <p className="font-bold text-slate-950">
                                            {item.total_quantity}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucun mouvement sur la periode.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Mouvements recents
                        </h2>
                        <div className="mt-5 space-y-3">
                            {recentMovements.length ? (
                                recentMovements.map((movement) => (
                                    <div
                                        key={movement.id}
                                        className="rounded-2xl bg-slate-50 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {movement.article?.name ||
                                                        'Article'}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {movement.user?.name ||
                                                        'Systeme'}{' '}
                                                    -{' '}
                                                    {formatDate(
                                                        movement.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <p className="font-bold text-slate-950">
                                                {movement.movement_type} -{' '}
                                                {movement.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucun mouvement recent.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Stock faible
                        </h2>
                        <div className="mt-5 space-y-3">
                            {lowStockArticles.length ? (
                                lowStockArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="rounded-2xl bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-950">
                                            {article.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Stock {article.current_stock} /
                                            Seuil {article.alert_threshold}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucun article critique.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Expiration proche
                        </h2>
                        <div className="mt-5 space-y-3">
                            {expiringSoon.length ? (
                                expiringSoon.map((article) => (
                                    <div
                                        key={article.id}
                                        className="rounded-2xl bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-950">
                                            {article.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Expire le{' '}
                                            {formatDate(
                                                article.expiration_date,
                                            )}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucune peremption proche.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Articles expires
                        </h2>
                        <div className="mt-5 space-y-3">
                            {expired.length ? (
                                expired.map((article) => (
                                    <div
                                        key={article.id}
                                        className="rounded-2xl bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-950">
                                            {article.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Expire le{' '}
                                            {formatDate(
                                                article.expiration_date,
                                            )}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucun article expire.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
