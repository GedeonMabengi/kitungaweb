import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    Pencil,
    Power,
    Search,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import adminUserRoutes from '@/routes/admin/users';

export default function AdminUsersIndex({ users, roles, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [active, setActive] = useState(filters.active ?? '');

    const handleFilter = (event) => {
        event.preventDefault();

        router.get(
            adminUserRoutes.index.url(),
            {
                search,
                role: role || undefined,
                active: active === '' ? undefined : active,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = (user) => {
        if (window.confirm(`Supprimer ${user.name} ?`)) {
            router.delete(adminUserRoutes.destroy.url(user.id));
        }
    };

    const handleToggleActive = (user) => {
        router.post(adminUserRoutes.toggleActive.url(user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Administration</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Gestion des utilisateurs et des roles
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Consulte les comptes, leurs roles et leur etat
                            d&apos;activation depuis le back-office.
                        </p>
                    </div>
                    <Link
                        href={adminUserRoutes.create()}
                        className="app-button-accent"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nouvel utilisateur
                    </Link>
                </div>
            }
        >
            <Head title="Utilisateurs" />

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
                                placeholder="Nom ou email..."
                                className="app-input pl-11"
                            />
                        </label>

                        <select
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            className="app-select"
                        >
                            <option value="">Tous les roles</option>
                            {roles.map((item) => (
                                <option key={item.id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={active}
                            onChange={(event) => setActive(event.target.value)}
                            className="app-select"
                        >
                            <option value="">Tous les etats</option>
                            <option value="1">Actifs</option>
                            <option value="0">Inactifs</option>
                        </select>

                        <button type="submit" className="app-button-primary">
                            Filtrer
                        </button>
                    </form>
                </section>

                <section className="grid gap-4">
                    {users.data.length > 0 ? (
                        users.data.map((user) => (
                            <article key={user.id} className="app-card">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-950">
                                                {user.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {user.email}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {(user.roles || []).map(
                                                    (item) => (
                                                        <span
                                                            key={item.id}
                                                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                                                        >
                                                            {item.name}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                user.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {user.is_active
                                                ? 'Actif'
                                                : 'Inactif'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={adminUserRoutes.show(user.id)}
                                        className="app-button-secondary"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Voir
                                    </Link>
                                    <Link
                                        href={adminUserRoutes.edit(user.id)}
                                        className="app-button-secondary"
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(user)}
                                        className="app-button-secondary"
                                    >
                                        <Power className="mr-2 h-4 w-4" />
                                        {user.is_active
                                            ? 'Desactiver'
                                            : 'Activer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user)}
                                        className="app-button-secondary border-rose-200 text-rose-700 hover:bg-rose-50"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="app-card">
                            <p className="text-sm text-slate-500">
                                Aucun utilisateur ne correspond aux filtres
                                actuels.
                            </p>
                        </div>
                    )}
                </section>

                <div className="app-card">
                    <Pagination links={users.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
