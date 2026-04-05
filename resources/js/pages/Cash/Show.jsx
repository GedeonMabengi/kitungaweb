import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useOrganizationCurrency } from '@/lib/currency';

export default function CashShow({ register }) {
    const { formatCurrency } = useOrganizationCurrency();
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <span className="app-badge">Caisse</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                            Detail de la caisse du {register.date}
                        </h1>
                    </div>
                    <Link href="/cash" className="app-button-secondary">
                        Retour a l&apos;historique
                    </Link>
                </div>
            }
        >
            <Head title={`Caisse ${register.date}`} />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Ouverture</p>
                        <p className="mt-3 text-2xl font-extrabold text-slate-950">
                            {formatCurrency(register.opening_balance)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Entrees</p>
                        <p className="mt-3 text-2xl font-extrabold text-slate-950">
                            {formatCurrency(register.total_input)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Sorties</p>
                        <p className="mt-3 text-2xl font-extrabold text-slate-950">
                            {formatCurrency(register.total_output)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Statut</p>
                        <p className="mt-3 text-2xl font-extrabold text-slate-950">
                            {register.status}
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Entrees de caisse
                        </h2>
                        <div className="mt-6 space-y-3">
                            {(register.inputs || []).length ? (
                                register.inputs.map((input) => (
                                    <div
                                        key={input.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {input.source}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {input.reference ||
                                                        'Sans reference'}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-emerald-700">
                                                {formatCurrency(input.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucune entree enregistree.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="app-card">
                        <h2 className="text-xl font-bold text-slate-950">
                            Sorties de caisse
                        </h2>
                        <div className="mt-6 space-y-3">
                            {(register.outputs || []).length ? (
                                register.outputs.map((output) => (
                                    <div
                                        key={output.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {output.reason}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {output.reference ||
                                                        'Sans reference'}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-rose-700">
                                                {formatCurrency(output.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                    Aucune sortie enregistree.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
