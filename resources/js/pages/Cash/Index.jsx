import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import { useOrganizationCurrency } from '@/lib/currency';

export default function CashIndex({ registers, filters, canViewAll }) {
    const { formatCurrency } = useOrganizationCurrency();
    const applyFilters = (event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        router.get('/cash', {
            status: form.get('status') || '',
            start_date: form.get('start_date') || '',
            end_date: form.get('end_date') || '',
            user_id: form.get('user_id') || '',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <span className="app-badge">Caisse</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                            Historique des caisses
                        </h1>
                    </div>
                    <Link href="/cash/dashboard" className="app-button-primary">
                        Tableau de caisse
                    </Link>
                </div>
            }
        >
            <Head title="Caisses" />

            <div className="space-y-6">
                <form onSubmit={applyFilters} className="app-card">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                            <span>Statut</span>
                            <select
                                name="status"
                                defaultValue={filters.status || ''}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            >
                                <option value="">Tous</option>
                                <option value="OPEN">Ouverte</option>
                                <option value="CLOSED">Cloturee</option>
                            </select>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                            <span>Du</span>
                            <input
                                type="date"
                                name="start_date"
                                defaultValue={filters.start_date || ''}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                            <span>Au</span>
                            <input
                                type="date"
                                name="end_date"
                                defaultValue={filters.end_date || ''}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            />
                        </label>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="app-button-secondary w-full justify-center"
                            >
                                Filtrer
                            </button>
                        </div>
                    </div>
                    {canViewAll ? (
                        <p className="mt-4 text-sm text-slate-500">
                            Les administrateurs et caissiers autorises peuvent
                            consulter l&apos;historique global.
                        </p>
                    ) : null}
                </form>

                <div className="space-y-4">
                    {registers.data.length ? (
                        registers.data.map((register) => (
                            <article key={register.id} className="app-card">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-lg font-bold text-slate-950">
                                            Caisse du {register.date}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {register.user?.name ||
                                                'Utilisateur'}{' '}
                                            · {register.status}
                                        </p>
                                    </div>
                                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
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
                                                Solde attendu
                                            </p>
                                            <p className="font-semibold text-slate-950">
                                                {formatCurrency(
                                                    register.expected_balance,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">
                                                Solde reel
                                            </p>
                                            <p className="font-semibold text-slate-950">
                                                {register.actual_balance
                                                    ? formatCurrency(
                                                          register.actual_balance,
                                                      )
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/cash/${register.id}`}
                                        className="app-button-secondary"
                                    >
                                        Voir le detail
                                    </Link>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="app-card text-center text-sm text-slate-500">
                            Aucune caisse ne correspond aux filtres actuels.
                        </div>
                    )}
                </div>

                <Pagination links={registers.links} />
            </div>
        </AuthenticatedLayout>
    );
}
