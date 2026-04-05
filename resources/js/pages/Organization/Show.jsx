import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CreditCard,
    Link2,
    ShieldCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(Number(amount || 0));
}

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

export default function OrganizationShow({
    organization,
    plans,
    seatUsage,
    availableRoles,
    supportedCurrencies,
}) {
    const { auth, flash } = usePage().props;
    const inviteForm = useForm({
        email: '',
        role: availableRoles?.includes('vendeur')
            ? 'vendeur'
            : availableRoles?.[0] || '',
        expires_in_days: 7,
    });
    const settingsForm = useForm({
        name: organization.name || '',
        billing_email: organization.billing_email || '',
        phone: organization.phone || '',
        country_code: organization.country_code || 'CD',
        currency: organization.currency || 'CDF',
    });

    const isAdmin =
        auth?.user?.roles?.some((role) => role.name === 'admin') ?? false;

    const startCheckout = (planCode, billingCycle) => {
        router.post('/organization/subscription/checkout', {
            plan_code: planCode,
            billing_cycle: billingCycle,
        });
    };

    const subscription =
        organization.current_subscription || organization.currentSubscription;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Organisation</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {organization.name}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Abonnement, collaborateurs et securite d&apos;acces
                            sont centralises ici.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Organisation" />

            <div className="space-y-6">
                {flash?.success ? (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                ) : null}

                {flash?.error ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
                        {flash.error}
                    </div>
                ) : null}

                {flash?.invitation_link ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                        <p className="font-semibold">
                            Lien d&apos;invitation genere
                        </p>
                        <a
                            href={flash.invitation_link}
                            className="mt-2 block font-medium break-all text-amber-700 underline"
                        >
                            {flash.invitation_link}
                        </a>
                    </div>
                ) : null}

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Statut</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {organization.status}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Plan {subscription?.plan_name || 'non defini'}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Utilisateurs</p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-950">
                            {seatUsage.active_users}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            {seatUsage.limit
                                ? `${seatUsage.pending_invitations} invitation(s) en attente sur ${seatUsage.limit} places`
                                : `${seatUsage.pending_invitations} invitation(s) en attente`}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Facturation</p>
                        <p className="mt-3 text-xl font-extrabold text-slate-950">
                            {organization.billing_email || '-'}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Echeance {formatDate(subscription?.ends_at)}
                        </p>
                    </div>
                    <div className="app-stat-card">
                        <p className="text-sm text-slate-500">Proprietaire</p>
                        <p className="mt-3 text-xl font-extrabold text-slate-950">
                            {organization.owner?.name || '-'}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            {organization.owner?.email || '-'}
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="app-card">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Profil de l&apos;organisation
                                    </h2>
                                </div>
                            </div>

                            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Nom
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {organization.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Slug
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {organization.slug}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Devise
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {organization.currency}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Abonnement
                                    </dt>
                                    <dd className="mt-1 font-semibold text-slate-950">
                                        {subscription?.plan_name || '-'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {isAdmin ? (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    settingsForm.patch('/organization');
                                }}
                                className="app-card"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-950">
                                            Parametres de l&apos;organisation
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">
                                            Nom
                                        </span>
                                        <input
                                            type="text"
                                            value={settingsForm.data.name}
                                            onChange={(event) =>
                                                settingsForm.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition outline-none focus:border-amber-400"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">
                                            Email de facturation
                                        </span>
                                        <input
                                            type="email"
                                            value={
                                                settingsForm.data.billing_email
                                            }
                                            onChange={(event) =>
                                                settingsForm.setData(
                                                    'billing_email',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition outline-none focus:border-amber-400"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">
                                            Telephone
                                        </span>
                                        <input
                                            type="text"
                                            value={settingsForm.data.phone}
                                            onChange={(event) =>
                                                settingsForm.setData(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition outline-none focus:border-amber-400"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">
                                            Devise par defaut
                                        </span>
                                        <select
                                            value={settingsForm.data.currency}
                                            onChange={(event) =>
                                                settingsForm.setData(
                                                    'currency',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition outline-none focus:border-amber-400"
                                        >
                                            {Object.entries(
                                                supportedCurrencies || {},
                                            ).map(([code, label]) => (
                                                <option key={code} value={code}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="app-button-primary mt-6"
                                >
                                    Enregistrer les parametres
                                </button>
                            </form>
                        ) : null}

                        <div className="app-card">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Collaborateurs
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {(organization.users || []).length ? (
                                    organization.users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="font-semibold text-slate-950">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-medium text-slate-600">
                                                    {user.roles?.[0]?.name ||
                                                        '-'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                        Aucun collaborateur supplementaire pour
                                        le moment.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="app-card">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                    <Link2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Invitations en attente
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {(organization.invitations || []).length ? (
                                    organization.invitations.map(
                                        (invitation) => {
                                            const acceptUrl = `/organization/invitations/${invitation.token}`;

                                            return (
                                                <div
                                                    key={invitation.id}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <p className="font-semibold text-slate-950">
                                                                    {
                                                                        invitation.email
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    Role{' '}
                                                                    {
                                                                        invitation.role
                                                                    }{' '}
                                                                    · expire le{' '}
                                                                    {formatDate(
                                                                        invitation.expires_at,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-600">
                                                                {
                                                                    invitation.status
                                                                }
                                                            </span>
                                                        </div>
                                                        <Link
                                                            href={acceptUrl}
                                                            className="text-sm font-medium break-all text-amber-700 underline"
                                                        >
                                                            {acceptUrl}
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                        Aucune invitation en attente.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {isAdmin ? (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    inviteForm.post(
                                        '/organization/invitations',
                                    );
                                }}
                                className="app-card"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-950">
                                            Inviter un collaborateur
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Adresse email
                                        </label>
                                        <input
                                            type="email"
                                            value={inviteForm.data.email}
                                            onChange={(event) =>
                                                inviteForm.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-0 transition outline-none focus:border-amber-400"
                                            placeholder="collegue@entreprise.com"
                                        />
                                        {inviteForm.errors.email ? (
                                            <p className="text-sm text-rose-600">
                                                {inviteForm.errors.email}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                Role
                                            </label>
                                            <select
                                                value={inviteForm.data.role}
                                                onChange={(event) =>
                                                    inviteForm.setData(
                                                        'role',
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-0 transition outline-none focus:border-amber-400"
                                            >
                                                {availableRoles.map((role) => (
                                                    <option
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                Expiration
                                            </label>
                                            <select
                                                value={
                                                    inviteForm.data
                                                        .expires_in_days
                                                }
                                                onChange={(event) =>
                                                    inviteForm.setData(
                                                        'expires_in_days',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-0 transition outline-none focus:border-amber-400"
                                            >
                                                <option value={3}>
                                                    3 jours
                                                </option>
                                                <option value={7}>
                                                    7 jours
                                                </option>
                                                <option value={14}>
                                                    14 jours
                                                </option>
                                                <option value={30}>
                                                    30 jours
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={inviteForm.processing}
                                        className="app-button-primary w-full justify-center"
                                    >
                                        Envoyer l&apos;invitation
                                    </button>
                                </div>
                            </form>
                        ) : null}

                        <div className="app-card">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Paiements recents
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {(organization.payments || []).length ? (
                                    organization.payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="font-semibold text-slate-950">
                                                        {payment.transaction_id}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {payment.status}
                                                    </p>
                                                </div>
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(
                                                        payment.amount,
                                                        payment.currency,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                        Aucun paiement enregistre pour le
                                        moment.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(plans).map(([planCode, plan]) => (
                                <article key={planCode} className="app-card">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-bold text-slate-950">
                                                {plan.name}
                                            </p>
                                            <div className="mt-3 space-y-2 text-sm text-slate-500">
                                                {plan.features.map(
                                                    (feature) => (
                                                        <div
                                                            key={feature}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                            <span>
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                            <Users className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-4 text-sm text-slate-500">
                                        {plan.seats_limit
                                            ? `${plan.seats_limit} utilisateurs inclus`
                                            : 'Utilisateurs illimites'}
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            className="app-button-primary"
                                            onClick={() =>
                                                startCheckout(
                                                    planCode,
                                                    'monthly',
                                                )
                                            }
                                        >
                                            {formatCurrency(
                                                plan.monthly_amount,
                                                plan.currency,
                                            )}{' '}
                                            / mois
                                        </button>
                                        <button
                                            type="button"
                                            className="app-button-secondary"
                                            onClick={() =>
                                                startCheckout(
                                                    planCode,
                                                    'yearly',
                                                )
                                            }
                                        >
                                            {formatCurrency(
                                                plan.yearly_amount,
                                                plan.currency,
                                            )}{' '}
                                            / an
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
