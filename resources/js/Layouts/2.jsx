import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    BarChart3,
    Boxes,
    LayoutDashboard,
    LogOut,
    Menu,
    PackageSearch,
    ShoppingCart,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', href: '/categories', icon: Boxes },
    { name: 'Articles', href: '/articles', icon: PackageSearch },
    { name: 'Stock', href: '/stock/movements', icon: Boxes },
    { name: 'Point de vente', href: '/sales/pos', icon: ShoppingCart },
    { name: 'Ventes', href: '/sales', icon: ShoppingCart },
    { name: 'Caisse', href: '/cash/dashboard', icon: Banknote },
    { name: 'Rapports', href: '/reports', icon: BarChart3 },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
];

function initials(name) {
    return (name ?? 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

export default function AuthenticatedLayout({ children, header }) {
    const { auth, url } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userName = auth?.user?.name ?? 'Utilisateur';
    const userEmail = auth?.user?.email ?? null;

    const currentSection = useMemo(() => {
        return navigation.find(
            (item) => url === item.href || url.startsWith(`${item.href}/`),
        );
    }, [url]);

    return (
        <div className="min-h-screen bg-transparent text-slate-900">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_58%)]" />
                <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
                <aside className="hidden w-[290px] shrink-0 lg:block">
                    <div className="app-shell-bg sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden bg-slate-950 text-white">
                        <div className="border-b border-white/10 px-6 py-6">
                            <p className="text-xs font-semibold tracking-[0.32em] text-amber-300/80 uppercase">
                                Kitunga
                            </p>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
                                Commerce cockpit
                            </h1>
                            <p className="mt-2 text-sm text-slate-300">
                                Stock, ventes, caisse et supervision dans une
                                seule interface.
                            </p>
                        </div>

                        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active =
                                    url === item.href ||
                                    url.startsWith(`${item.href}/`);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-white text-slate-950 shadow-[0_12px_30px_-18px_rgba(255,255,255,0.7)]'
                                                : 'text-slate-300 hover:bg-white/8 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="border-t border-white/10 px-5 py-5">
                            <div className="rounded-2xl bg-white/8 p-4">
                                <p className="text-xs tracking-[0.28em] text-slate-400 uppercase">
                                    Session
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 font-bold text-slate-950">
                                        {initials(userName)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">
                                            {userName}
                                        </p>
                                        {userEmail ? (
                                            <p className="truncate text-xs text-slate-400">
                                                {userEmail}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Se deconnecter</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>

                {sidebarOpen ? (
                    <div
                        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div
                            className="app-shell-bg absolute top-4 left-4 h-[calc(100vh-2rem)] w-[min(86vw,320px)] overflow-hidden bg-slate-950 text-white"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                                <div>
                                    <p className="text-xs tracking-[0.3em] text-amber-300/70 uppercase">
                                        Menu
                                    </p>
                                    <p className="mt-2 text-xl font-bold">
                                        Navigation
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-2xl border border-white/12 p-2 text-white"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-2 px-4 py-5">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const active =
                                        url === item.href ||
                                        url.startsWith(`${item.href}/`);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                                active
                                                    ? 'bg-white text-slate-950'
                                                    : 'text-slate-300 hover:bg-white/8'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : null}

                <main className="flex min-w-0 flex-1 flex-col gap-6 pb-8">
                    <div className="app-shell-bg px-4 py-4 sm:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className="inline-flex rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm lg:hidden"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.26em] text-slate-400 uppercase">
                                        Vue active
                                    </p>
                                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                                        {currentSection?.name ??
                                            'Espace de travail'}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:block">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {userName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Session connectee
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-bold text-white">
                                    {initials(userName)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {header ? (
                        <section className="app-shell-bg overflow-hidden">
                            <div className="relative px-6 py-6 sm:px-8 sm:py-8">
                                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
                                <div className="absolute bottom-0 left-1/2 h-28 w-28 rounded-full bg-teal-300/20 blur-3xl" />
                                <div className="relative">{header}</div>
                            </div>
                        </section>
                    ) : null}

                    <section className="relative">{children}</section>
                </main>
            </div>
        </div>
    );
}
