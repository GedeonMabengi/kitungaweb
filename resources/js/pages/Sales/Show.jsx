import { Head, Link, router, usePage } from '@inertiajs/react';
import { Ban, Printer, Receipt, UserRound, Wallet } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useOrganizationCurrency } from '@/lib/currency';
import salesRoutes from '@/routes/sales';

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusClasses(status) {
    if (status === 'PAID') {
        return 'bg-emerald-100 text-emerald-700';
    }

    if (status === 'CANCELLED') {
        return 'bg-rose-100 text-rose-700';
    }

    if (status === 'PENDING') {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-slate-100 text-slate-700';
}

export default function SalesShow({ sale }) {
    const page = usePage();
    const { formatCurrency } = useOrganizationCurrency();
    const permissions = page.props.auth?.user?.permissions ?? [];
    const roles = page.props.auth?.user?.roles ?? [];
    const canCancel =
        permissions.includes('sales.edit') ||
        roles.some((role) => role.name === 'admin');

    const handleCancel = () => {
        if (!window.confirm(`Annuler la vente ${sale.reference} ?`)) {
            return;
        }

        router.post(salesRoutes.cancel.url(sale.id));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between print:hidden">
                    <div className="max-w-3xl">
                        <span className="app-badge">Vente</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {sale.reference}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Detail de la transaction, des articles vendus et du
                            mode d&apos;encaissement.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="app-button-secondary"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimer le recu
                        </button>
                        {canCancel && sale.payment_status !== 'CANCELLED' ? (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="app-button-secondary border-rose-200 text-rose-700 hover:bg-rose-50"
                            >
                                <Ban className="mr-2 h-4 w-4" />
                                Annuler la vente
                            </button>
                        ) : null}
                        <Link
                            href={salesRoutes.index()}
                            className="app-button-secondary"
                        >
                            Retour aux ventes
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={sale.reference} />

            <div className="space-y-6">
                <section className="hidden rounded-3xl border border-slate-200 bg-white p-6 print:block print:space-y-4">
                    <div className="border-b border-slate-200 pb-4 text-center">
                        <h2 className="text-2xl font-extrabold text-slate-950">
                            Recu de vente
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {sale.reference}
                        </p>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p>Date: {formatDate(sale.created_at)}</p>
                        <p>Vendeur: {sale.user?.name || '-'}</p>
                        <p>
                            Client:{' '}
                            {sale.customer_name || 'Client non renseigne'}
                        </p>
                        <p>Paiement: {sale.payment_method}</p>
                    </div>
                    <div className="space-y-2 border-t border-slate-200 pt-4">
                        {sale.items?.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between text-sm"
                            >
                                <span>
                                    {item.article?.name || '-'} -{' '}
                                    {item.quantity} {item.quantity_type}
                                </span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span>Sous-total</span>
                            <span>{formatCurrency(sale.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Remise</span>
                            <span>{formatCurrency(sale.discount)}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-slate-950">
                            <span>Total</span>
                            <span>{formatCurrency(sale.total_amount)}</span>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {formatCurrency(sale.total_amount)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Montant paye</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {formatCurrency(sale.amount_paid)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Rendu</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {formatCurrency(sale.change_amount)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Statut</p>
                        <div className="mt-3">
                            <span
                                className={`rounded-full px-3 py-2 text-sm font-semibold ${statusClasses(sale.payment_status)}`}
                            >
                                {sale.payment_status}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] print:grid-cols-1">
                    <div className="space-y-6">
                        <div className="app-card">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Informations generales
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Creee le {formatDate(sale.created_at)}
                                    </p>
                                </div>
                            </div>

                            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Vendeur
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {sale.user?.name || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Paiement
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {sale.payment_method}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Client
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {sale.customer_name ||
                                            'Client non renseigne'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Telephone
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {sale.customer_phone || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Caisse
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {sale.cash_register_id ||
                                            sale.cash_register?.id ||
                                            '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Articles
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {sale.items?.length || 0}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                                <p className="text-sm leading-6 text-slate-600">
                                    {sale.notes || 'Aucune note associee.'}
                                </p>
                            </div>
                        </div>

                        <div className="app-card">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                    <UserRound className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Resume financier
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">
                                        Sous-total
                                    </span>
                                    <span className="font-semibold text-slate-950">
                                        {formatCurrency(sale.subtotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">
                                        Remise
                                    </span>
                                    <span className="font-semibold text-slate-950">
                                        {formatCurrency(sale.discount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Taxe</span>
                                    <span className="font-semibold text-slate-950">
                                        {formatCurrency(sale.tax)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                                    <span className="font-medium text-slate-600">
                                        Total net
                                    </span>
                                    <span className="text-lg font-extrabold text-slate-950">
                                        {formatCurrency(sale.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="app-card">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Articles vendus
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Detail des lignes enregistrees sur la vente.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {sale.items?.length ? (
                                sale.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {item.article?.name || '-'}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {item.quantity}{' '}
                                                    {item.quantity_type}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(
                                                        item.subtotal,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {formatCurrency(
                                                        item.unit_price,
                                                    )}{' '}
                                                    / unite
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucun article rattache a cette vente.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
