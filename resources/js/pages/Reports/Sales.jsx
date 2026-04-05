import { Head, Link, router } from '@inertiajs/react';
import { CalendarRange, ShoppingBag, TrendingUp, Users } from 'lucide-react';
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

export default function ReportsSales({
    salesByDay,
    salesByUser,
    topArticles,
    recentSales,
    totals,
    scopeLabel,
    filters,
}) {
    const { formatCurrency } = useOrganizationCurrency();

    const submitFilters = (event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        router.get(
            reports.sales.url(),
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
                        <span className="app-badge">Rapports ventes</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Analyse commerciale
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Lecture des ventes sur la periode choisie, avec une
                            portee adaptee a ton role.
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
            <Head title="Rapports ventes" />

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
                                <p className="text-sm text-slate-500">Portee</p>
                                <p className="mt-3 text-2xl font-extrabold text-slate-950">
                                    {scopeLabel}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Nombre de ventes
                                </p>
                                <p className="mt-3 text-2xl font-extrabold text-slate-950">
                                    {totals.count}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Chiffre d'affaires
                                </p>
                                <p className="mt-3 text-2xl font-extrabold text-slate-950">
                                    {formatCurrency(totals.amount)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Periode
                                </p>
                                <p className="mt-3 text-lg font-extrabold text-slate-950">
                                    {filters.start_date} au {filters.end_date}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <CalendarRange className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Ventes par jour
                        </h2>
                        <div className="mt-5 space-y-3">
                            {salesByDay.length ? (
                                salesByDay.map((day) => (
                                    <div
                                        key={day.date}
                                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {formatDate(day.date)}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {day.count} vente(s)
                                            </p>
                                        </div>
                                        <p className="font-bold text-emerald-700">
                                            {formatCurrency(day.total)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucune vente sur la periode.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Performance par vendeur
                        </h2>
                        <div className="mt-5 space-y-3">
                            {salesByUser.length ? (
                                salesByUser.map((item) => (
                                    <div
                                        key={item.user_id ?? 'unknown'}
                                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {item.user?.name ||
                                                    'Utilisateur'}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {item.count} vente(s)
                                            </p>
                                        </div>
                                        <p className="font-bold text-slate-950">
                                            {formatCurrency(item.total)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucune donnee vendeur disponible.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Top articles
                        </h2>
                        <div className="mt-5 space-y-3">
                            {topArticles.length ? (
                                topArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {article.name}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {article.total_quantity}{' '}
                                                unite(s) vendue(s)
                                            </p>
                                        </div>
                                        <p className="font-bold text-slate-950">
                                            {formatCurrency(
                                                article.total_revenue,
                                            )}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucun article top sur la periode.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Ventes recentes
                        </h2>
                        <div className="mt-5 space-y-3">
                            {recentSales.length ? (
                                recentSales.map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="rounded-2xl bg-slate-50 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {sale.reference}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {sale.user?.name ||
                                                        sale.customer_name ||
                                                        'Client'}
                                                </p>
                                            </div>
                                            <p className="font-bold text-emerald-700">
                                                {formatCurrency(
                                                    sale.total_amount,
                                                )}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {formatDate(sale.created_at)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucune vente recente.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
