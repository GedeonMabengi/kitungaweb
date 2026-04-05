import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import adminUserRoutes from '@/routes/admin/users';

export default function UserForm({ user = null, roles, mode = 'create' }) {
    const isEditing = mode === 'edit';
    const selectedRole = user?.roles?.[0]?.name ?? '';

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        password: '',
        password_confirmation: '',
        role: selectedRole,
        is_active: user?.is_active ?? true,
    });

    const submit = (event) => {
        event.preventDefault();

        const request = form.transform((data) => {
            const normalizedData = {
                ...data,
                phone: data.phone || null,
            };

            if (isEditing) {
                return {
                    ...normalizedData,
                    _method: 'put',
                };
            }

            return normalizedData;
        });

        if (isEditing) {
            request.post(adminUserRoutes.update.url(user.id));

            return;
        }

        request.post(adminUserRoutes.store.url());
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Administration</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {isEditing
                                ? "Modifier l'utilisateur"
                                : 'Creer un utilisateur'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Configure le compte, le role et le statut
                            d&apos;activation depuis le back-office.
                        </p>
                    </div>
                    <Link
                        href={adminUserRoutes.index()}
                        className="app-button-secondary"
                    >
                        Retour a la liste
                    </Link>
                </div>
            }
        >
            <form onSubmit={submit} className="app-card space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Nom
                        </label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            className="app-input"
                            required
                        />
                        {form.errors.name ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.name}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            className="app-input"
                            required
                        />
                        {form.errors.email ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.email}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Telephone
                        </label>
                        <input
                            type="text"
                            value={form.data.phone}
                            onChange={(event) =>
                                form.setData('phone', event.target.value)
                            }
                            className="app-input"
                        />
                        {form.errors.phone ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.phone}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Role
                        </label>
                        <select
                            value={form.data.role}
                            onChange={(event) =>
                                form.setData('role', event.target.value)
                            }
                            className="app-select"
                            required
                        >
                            <option value="">Choisir un role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.role ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.role}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            {isEditing
                                ? 'Nouveau mot de passe'
                                : 'Mot de passe'}
                        </label>
                        <input
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            className="app-input"
                            required={!isEditing}
                        />
                        {form.errors.password ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.password}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Confirmation mot de passe
                        </label>
                        <input
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            className="app-input"
                            required={!isEditing || form.data.password !== ''}
                        />
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={Boolean(form.data.is_active)}
                            onChange={(event) =>
                                form.setData('is_active', event.target.checked)
                            }
                        />
                        Utilisateur actif
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="app-button-accent"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Enregistrement...'
                            : isEditing
                              ? 'Mettre a jour'
                              : "Creer l'utilisateur"}
                    </button>
                    <Link
                        href={adminUserRoutes.index()}
                        className="app-button-secondary"
                    >
                        Annuler
                    </Link>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
