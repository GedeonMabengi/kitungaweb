import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowRight,
    Banknote,
    CalendarClock,
    CreditCard,
    Package,
    RefreshCcw,
    ShoppingBag,
    Wallet,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthorization } from '@/lib/authorization';
import { useOrganizationCurrency } from '@/lib/currency';

type Role = { name: string };
type DashboardUser = { name: string; roles?: Role[] };
type Sale = {
    id: number;
    reference: string;
    total_amount: number | string;
    created_at: string;
    customer_name?: string | null;
    user?: { name: string } | null;
};
type Movement = {
    id: number;
    movement_type: string;
    quantity: number | string;
    created_at: string;
    article?: { name: string } | null;
    user?: { name: string } | null;
};
type Article = {
    id: number;
    name: string;
    expiration_date?: string | null;
};
type Register = {
    opening_balance?: number | string;
    total_input?: number | string;
    total_output?: number | string;
} | null;
type DashboardProps = {
    user: DashboardUser;
    totalArticles?: number;
    lowStockArticles?: number | Article[];
    todaySales?: number | string;
    todaySalesCount?: number;
    monthSales?: number | string;
    recentSales?: Sale[];
    recentMovements?: Movement[];
    expiringArticles?: Article[];
    openRegister?: Register;
    hasOpenRegister?: boolean;
};
type MetricTone = 'amber' | 'emerald' | 'sky' | 'slate';

function formatDate(value?: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function roleLabel(role: string): string {
    return (
        {
            admin: 'Administrateur',
            gestionnaire_stock: 'Gestionnaire stock',
            vendeur: 'Vendeur',
            caissier: 'Caissier',
        }[role] ?? role
    );
}

function DashboardMetric({
    icon: Icon,
    label,
    value,
    tone = 'slate',
}: {
    icon: LucideIcon;
    label: string;
    value: string | number;
    tone?: MetricTone;
}) {
    const tones: Record<MetricTone, string> = {
        amber: 'bg-amber-100 text-amber-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        sky: 'bg-sky-100 text-sky-700',
        slate: 'bg-slate-100 text-slate-700',
    };

    return (
        <div className="app-stat-card">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                        {value}
                    </p>
                </div>
                <div
                    className={`rounded-2xl p-3 ${tones[tone] ?? tones.slate}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function HeroSummary({
    isAdmin,
    isStockManager,
    isSeller,
    isCashier,
    totalArticles,
    lowStockCount,
    todaySales,
    todaySalesCount,
    monthSales,
    hasOpenRegister,
    currentBalance,
    formatCurrency,
}: {
    isAdmin: boolean;
    isStockManager: boolean;
    isSeller: boolean;
    isCashier: boolean;
    totalArticles: number;
    lowStockCount: number;
    todaySales: number | string;
    todaySalesCount: number;
    monthSales: number | string;
    hasOpenRegister: boolean;
    currentBalance: number;
    formatCurrency: (value?: number | string) => string;
}) {
    if (isStockManager) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="app-card-muted bg-slate-950 text-white">
                    <p className="text-sm text-slate-300">Articles suivis</p>
                    <p className="mt-3 text-2xl font-extrabold">
                        {totalArticles}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        Catalogue actif de votre organisation
                    </p>
                </div>
                <div className="app-card-muted bg-white">
                    <p className="text-sm text-slate-500">Alertes stock</p>
                    <p className="mt-3 text-2xl font-extrabold text-amber-700">
                        {lowStockCount}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Articles a reapprovisionner rapidement
                    </p>
                </div>
            </div>
        );
    }

    if (isCashier) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="app-card-muted bg-slate-950 text-white">
                    <p className="text-sm text-slate-300">Caisse du jour</p>
                    <p className="mt-3 text-2xl font-extrabold">
                        {hasOpenRegister ? 'Ouverte' : 'Fermee'}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        Partagee par votre organisation
                    </p>
                </div>
                <div className="app-card-muted bg-white">
                    <p className="text-sm text-slate-500">Solde courant</p>
                    <p className="mt-3 text-2xl font-extrabold text-slate-950">
                        {formatCurrency(currentBalance)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Entrees et sorties de la caisse active
                    </p>
                </div>
            </div>
        );
    }

    if (isAdmin || isSeller) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="app-card-muted bg-slate-950 text-white">
                    <p className="text-sm text-slate-300">Ventes aujourd hui</p>
                    <p className="mt-3 text-2xl font-extrabold">
                        {formatCurrency(todaySales)}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        {todaySalesCount} transaction(s)
                    </p>
                </div>
                <div className="app-card-muted bg-white">
                    <p className="text-sm text-slate-500">Mois en cours</p>
                    <p className="mt-3 text-2xl font-extrabold text-slate-950">
                        {formatCurrency(monthSales)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Activite cumulee sur la periode courante
                    </p>
                </div>
            </div>
        );
    }

    return null;
}

export default function Dashboard({
    user,
    totalArticles = 0,
    lowStockArticles = 0,
    todaySales = 0,
    todaySalesCount = 0,
    monthSales = 0,
    recentSales = [],
    recentMovements = [],
    expiringArticles = [],
    openRegister = null,
    hasOpenRegister = false,
}: DashboardProps) {
    const { formatCurrency } = useOrganizationCurrency();
    const { hasPermission } = useAuthorization();
    const roles = user.roles?.map((role) => role.name) ?? [];
    const isAdmin = roles.includes('admin');
    const isStockManager = roles.includes('gestionnaire_stock');
    const isSeller = roles.includes('vendeur');
    const isCashier = roles.includes('caissier');
    const canCreateSales =
        hasPermission('sales.create') && (isAdmin || isSeller);
    const canViewArticles = hasPermission('articles.view');
    const canViewCash = hasPermission('cash.view') && !isSeller;
    const lowStockCount = Array.isArray(lowStockArticles)
        ? lowStockArticles.length
        : Number(lowStockArticles ?? 0);
    const currentBalance =
        Number(openRegister?.opening_balance ?? 0) +
        Number(openRegister?.total_input ?? 0) -
        Number(openRegister?.total_output ?? 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge bg-amber-100/80 text-amber-800">
                            Tableau de bord
                        </span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Vue generale de l'activite
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Suivi des ventes, du stock et de la caisse avec une
                            synthese adaptee au profil connecte.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canCreateSales ? (
                            <Link
                                href="/sales/pos"
                                className="app-button-accent"
                            >
                                Nouvelle vente
                            </Link>
                        ) : null}
                        {canViewArticles ? (
                            <Link
                                href="/articles"
                                className="app-button-secondary"
                            >
                                Voir le stock
                            </Link>
                        ) : null}
                        {canViewCash ? (
                            <Link
                                href="/cash/dashboard"
                                className="app-button-secondary"
                            >
                                Gerer la caisse
                            </Link>
                        ) : null}
                    </div>
                </div>
            }
        >
            <Head title="Tableau de bord" />

            <div className="space-y-6">
                <section className="app-shell-bg overflow-hidden p-6 sm:p-8">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.24em] text-slate-400 uppercase">
                                Bonjour
                            </p>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                                {user.name}
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                {isAdmin
                                    ? 'Vous pilotez l ensemble du systeme avec une vision transversale des ventes, du stock et des equipes.'
                                    : isStockManager
                                      ? 'Votre priorite du jour: surveiller les alertes de stock, les mouvements et les dates de peremption.'
                                      : isSeller
                                        ? 'Vous avez un acces oriente ventes pour garder le rythme en caisse et sur le point de vente.'
                                        : 'Vous suivez principalement la caisse et les flux financiers partages par votre organisation.'}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {roles.map((role) => (
                                    <span key={role} className="app-badge">
                                        {roleLabel(role)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <HeroSummary
                            isAdmin={isAdmin}
                            isStockManager={isStockManager}
                            isSeller={isSeller}
                            isCashier={isCashier}
                            totalArticles={Number(totalArticles)}
                            lowStockCount={lowStockCount}
                            todaySales={todaySales}
                            todaySalesCount={todaySalesCount}
                            monthSales={monthSales}
                            hasOpenRegister={hasOpenRegister}
                            currentBalance={currentBalance}
                            formatCurrency={formatCurrency}
                        />
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {isAdmin || isStockManager ? (
                        <>
                            <DashboardMetric
                                icon={Package}
                                label="Articles actifs"
                                value={totalArticles}
                            />
                            <DashboardMetric
                                icon={AlertTriangle}
                                label="Stock faible"
                                value={lowStockCount}
                                tone="amber"
                            />
                        </>
                    ) : null}
                    {isAdmin || isSeller ? (
                        <>
                            <DashboardMetric
                                icon={ShoppingBag}
                                label="Ventes du jour"
                                value={formatCurrency(todaySales)}
                                tone="emerald"
                            />
                            <DashboardMetric
                                icon={CreditCard}
                                label="Ventes du mois"
                                value={formatCurrency(monthSales)}
                                tone="sky"
                            />
                        </>
                    ) : null}
                    {isCashier ? (
                        <>
                            <DashboardMetric
                                icon={Wallet}
                                label="Caisse ouverte"
                                value={hasOpenRegister ? 'Oui' : 'Non'}
                                tone="sky"
                            />
                            <DashboardMetric
                                icon={RefreshCcw}
                                label="Solde courant"
                                value={formatCurrency(currentBalance)}
                                tone="amber"
                            />
                        </>
                    ) : null}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        {isAdmin || isSeller ? (
                            <div className="app-card">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                            Activite commerciale
                                        </p>
                                        <h3 className="mt-2 text-xl font-bold text-slate-950">
                                            Ventes recentes
                                        </h3>
                                    </div>
                                    <Link
                                        href="/sales"
                                        className="app-button-secondary px-3 py-2"
                                    >
                                        <span>Historique</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {recentSales.length > 0 ? (
                                        recentSales.map((sale) => (
                                            <div
                                                key={sale.id}
                                                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-950">
                                                        {sale.reference}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {sale.customer_name ||
                                                            sale.user?.name ||
                                                            'Client de passage'}
                                                    </p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="font-semibold text-emerald-700">
                                                        {formatCurrency(
                                                            sale.total_amount,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {formatDate(
                                                            sale.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                            Aucune vente recente a afficher.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {isAdmin || isStockManager ? (
                            <div className="app-card">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                            Stock
                                        </p>
                                        <h3 className="mt-2 text-xl font-bold text-slate-950">
                                            Mouvements recents
                                        </h3>
                                    </div>
                                    <Link
                                        href="/stock/movements"
                                        className="app-button-secondary px-3 py-2"
                                    >
                                        <span>Consulter</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {recentMovements.length > 0 ? (
                                        recentMovements.map((movement) => (
                                            <div
                                                key={movement.id}
                                                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-950">
                                                        {movement.article
                                                            ?.name ?? 'Article'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {movement.user?.name ??
                                                            'Systeme'}{' '}
                                                        -{' '}
                                                        {formatDate(
                                                            movement.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="font-semibold text-slate-900">
                                                        {movement.movement_type}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Quantite{' '}
                                                        {movement.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                            Aucun mouvement recent a afficher.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-6">
                        {isAdmin || isStockManager ? (
                            <div className="app-card bg-linear-to-br from-amber-50 via-white to-orange-50">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                        <CalendarClock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold tracking-[0.22em] text-amber-700/70 uppercase">
                                            Alertes
                                        </p>
                                        <h3 className="mt-1 text-xl font-bold text-slate-950">
                                            Peremption a surveiller
                                        </h3>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {expiringArticles.length > 0 ? (
                                        expiringArticles.map((article) => (
                                            <div
                                                key={article.id}
                                                className="rounded-2xl border border-amber-200/60 bg-white/80 p-4"
                                            >
                                                <p className="font-semibold text-slate-950">
                                                    {article.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Expire le{' '}
                                                    {formatDate(
                                                        article.expiration_date,
                                                    )}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-amber-200 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
                                            Aucun article critique pour le
                                            moment.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {isCashier ? (
                            <div className="app-card bg-linear-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
                                <p className="text-sm font-semibold tracking-[0.22em] text-teal-200/80 uppercase">
                                    Caisse
                                </p>
                                <h3 className="mt-2 text-2xl font-bold">
                                    Etat du poste
                                </h3>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                                        <p className="text-sm text-slate-300">
                                            Solde initial
                                        </p>
                                        <p className="mt-2 text-2xl font-bold">
                                            {formatCurrency(
                                                openRegister?.opening_balance,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                                        <p className="text-sm text-slate-300">
                                            Solde courant
                                        </p>
                                        <p className="mt-2 text-2xl font-bold">
                                            {formatCurrency(currentBalance)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href="/cash/dashboard"
                                        className="app-button-accent"
                                    >
                                        Gerer la caisse
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
