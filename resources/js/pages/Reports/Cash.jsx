import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    CalendarRange,
    Wallet,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useOrganizationCurrency } from '@/lib/currency';
import reports from '@/routes/reports';

export default function ReportsCash({
    dailySummary,
    totals,
    scopeLabel,
    filters,
}) {
    const { formatCurrency } = useOrganizationCurrency();

    const submitFilters = (event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        router.get(
            reports.cash.url(),
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
                        <span className="app-badge">Rapports caisse</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Flux et clotures de caisse
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Analyse des ouvertures, entrees, sorties et ecarts
                            de cloture sur la periode retenue.
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
            <Head title="Rapports caisse" />

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

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Portee</p>
                                <p className="mt-3 text-xl font-extrabold text-slate-950">
                                    {scopeLabel}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <CalendarRange className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Ouverture
                                </p>
                                <p className="mt-3 text-xl font-extrabold text-slate-950">
                                    {formatCurrency(totals.opening)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Entrees
                                </p>
                                <p className="mt-3 text-xl font-extrabold text-emerald-700">
                                    {formatCurrency(totals.inputs)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <ArrowDownLeft className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Sorties
                                </p>
                                <p className="mt-3 text-xl font-extrabold text-rose-700">
                                    {formatCurrency(totals.outputs)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="app-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Ecart cumule
                                </p>
                                <p className="mt-3 text-xl font-extrabold text-slate-950">
                                    {formatCurrency(totals.difference)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <CalendarRange className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="app-card">
                    <h2 className="text-xl font-bold text-slate-950">
                        Historique des caisses
                    </h2>
                    <div className="mt-5 space-y-3">
                        {dailySummary.length ? (
                            dailySummary.map((register) => (
                                <div
                                    key={register.id}
                                    className="rounded-2xl bg-slate-50 p-4"
                                >
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {register.date}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {register.user?.name ||
                                                    'Utilisateur'}{' '}
                                                � {register.status}
                                            </p>
                                        </div>
                                        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-4">
                                            <div>
                                                <p className="text-slate-500">
                                                    Ouverture
                                                </p>
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(
                                                        register.opening_balance,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">
                                                    Entrees
                                                </p>
                                                <p className="font-semibold text-emerald-700">
                                                    {formatCurrency(
                                                        register.total_input,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">
                                                    Sorties
                                                </p>
                                                <p className="font-semibold text-rose-700">
                                                    {formatCurrency(
                                                        register.total_output,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">
                                                    Ecart
                                                </p>
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(
                                                        register.difference,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                Aucune caisse sur la periode.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
