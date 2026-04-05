import { Head, Link } from '@inertiajs/react';
import { Activity, ShoppingCart, Users } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useOrganizationCurrency } from '@/lib/currency';
import adminUserRoutes from '@/routes/admin/users';

export default function AdminUserShow({ user, stats }) {
    const { formatCurrency } = useOrganizationCurrency();
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Administration</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {user.name}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Details du compte, role et activite metier de
                            l&apos;utilisateur.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={adminUserRoutes.edit(user.id)}
                            className="app-button-accent"
                        >
                            Modifier
                        </Link>
                        <Link
                            href={adminUserRoutes.index()}
                            className="app-button-secondary"
                        >
                            Retour
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={user.name} />

            <div className="space-y-6">
                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Ventes</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {stats.total_sales}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">
                            Chiffre d'affaires
                        </p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {formatCurrency(stats.total_sales_amount)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">
                            Mouvements stock
                        </p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {stats.stock_movements}
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="app-card space-y-4">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                Profil
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-slate-950">
                                Informations du compte
                            </h2>
                        </div>

                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-slate-500">Nom</dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {user.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">
                                    Email
                                </dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {user.email}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">
                                    Telephone
                                </dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {user.phone || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-500">
                                    Statut
                                </dt>
                                <dd className="mt-1 font-semibold text-slate-950">
                                    {user.is_active ? 'Actif' : 'Inactif'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="app-card">
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <Users className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-sm text-slate-500">Role</p>
                            <p className="mt-2 font-bold text-slate-950">
                                {user.roles?.[0]?.name || '-'}
                            </p>
                        </div>
                        <div className="app-card">
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-sm text-slate-500">
                                Ventes
                            </p>
                            <p className="mt-2 font-bold text-slate-950">
                                {stats.total_sales}
                            </p>
                        </div>
                        <div className="app-card">
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <Activity className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-sm text-slate-500">
                                Mouvements
                            </p>
                            <p className="mt-2 font-bold text-slate-950">
                                {stats.stock_movements}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
