import { Head, router } from '@inertiajs/react';
import { Receipt, Search } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import { useOrganizationCurrency } from '@/lib/currency';
import salesRoutes from '@/routes/sales';

export default function SalesIndex({ sales, filters, canViewAll }) {
    const { formatCurrency } = useOrganizationCurrency();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentMethod, setPaymentMethod] = useState(
        filters.payment_method || '',
    );

    const handleFilter = (event) => {
        event.preventDefault();

        router.get(
            salesRoutes.index.url(),
            {
                search,
                status: status || undefined,
                payment_method: paymentMethod || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Ventes</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Journal des ventes encaissees
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Consulte l&apos;historique des ventes, les montants
                            encaisses et les moyens de paiement utilises.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-lg">
                        <p className="text-xs text-slate-300">
                            {canViewAll ? 'Ventes globales' : 'Mes ventes'}
                        </p>
                        <p className="mt-1 text-xl font-extrabold">
                            {sales.total ?? sales.data.length}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Ventes" />

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
                                placeholder="Reference ou client..."
                                className="app-input pl-11"
                            />
                        </label>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="app-select"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="PAID">Payee</option>
                            <option value="PENDING">En attente</option>
                            <option value="CANCELLED">Annulee</option>
                        </select>

                        <select
                            value={paymentMethod}
                            onChange={(event) =>
                                setPaymentMethod(event.target.value)
                            }
                            className="app-select"
                        >
                            <option value="">Tous les paiements</option>
                            <option value="CASH">Especes</option>
                            <option value="CARD">Carte</option>
                            <option value="MOBILE">Mobile money</option>
                            <option value="CREDIT">Credit</option>
                            <option value="OTHER">Autre</option>
                        </select>

                        <button type="submit" className="app-button-primary">
                            Filtrer
                        </button>
                    </form>
                </section>

                <section className="grid gap-4">
                    {sales.data.length > 0 ? (
                        sales.data.map((sale) => (
                            <article key={sale.id} className="app-card">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                            <Receipt className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-950">
                                                {sale.reference}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {sale.customer_name ||
                                                    'Client non renseigne'}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {sale.user?.name || '-'} ·{' '}
                                                {sale.payment_method}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {sale.payment_status}
                                        </span>
                                        <span className="text-lg font-extrabold text-slate-950">
                                            {formatCurrency(sale.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="app-card">
                            <p className="text-sm text-slate-500">
                                Aucune vente ne correspond aux filtres actuels.
                            </p>
                        </div>
                    )}
                </section>

                <div className="app-card">
                    <Pagination links={sales.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
