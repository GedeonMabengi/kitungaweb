import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRight,
    BarChart3,
    Boxes,
    Building2,
    CreditCard,
    Menu,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

const modules = [
    [
        'Point de vente fluide',
        'Encaissement rapide, panier clair et parcours pense pour le comptoir.',
        ShoppingBag,
    ],
    [
        'Stock et mouvements',
        'Catalogue, alertes, seuils critiques et historique complet des mouvements.',
        Boxes,
    ],
    [
        'Caisse quotidienne',
        'Ouverture, entrees, sorties, cloture et reprise du solde precedent.',
        Wallet,
    ],
    [
        'Equipes et roles',
        'L admin invite ses collaborateurs et attribue un role a chacun.',
        Users,
    ],
] as const;

const saasFeatures = [
    [
        'MULTI-ORGANISATION',
        'Chaque entreprise travaille dans son propre espace.',
        'Les donnees de votre organisation restent isolees des autres clients.',
        Building2,
    ],
    [
        'COLLABORATION',
        'Un admin peut inviter toute son equipe.',
        'Le proprietaire cree son espace, ajoute ses collaborateurs et leur attribue un role.',
        Users,
    ],
    [
        'ABONNEMENT',
        'Un SaaS pense pour l Afrique avec CinetPay.',
        'L organisation choisit un plan, regle son abonnement et active ses modules.',
        CreditCard,
    ],
] as const;

const plans = [
    [
        'Starter',
        '$29 / mois',
        [
            '1 point de vente',
            'Gestion stock et caisse',
            'Jusqu a 5 collaborateurs',
        ],
    ],
    [
        'Business',
        '$79 / mois',
        ['Multi caisses', 'Rapports avances', 'Jusqu a 20 collaborateurs'],
    ],
    [
        'Enterprise',
        '$149 / mois',
        [
            'Collaborateurs illimites',
            'Support prioritaire',
            'Configuration sur mesure',
        ],
    ],
] as const;

const navigationItems = [
    { href: '#modules', label: 'Modules' },
    { href: '#saas', label: 'SaaS' },
    { href: '#plans', label: 'Plans' },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Kitunga" />

            <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#f6efe2_45%,#f8f5ef_100%)] text-slate-950">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_38%)]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <header className="rounded-[28px] border border-slate-200/70 bg-white/80 px-5 py-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:px-6">
                        <nav className="flex items-start justify-between gap-4 md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold tracking-[0.22em] text-slate-950 uppercase sm:text-base">
                                    Kitunga
                                </p>
                            </div>

                            <div className="hidden items-center gap-8 md:flex">
                                {navigationItems.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>

                            <div className="hidden items-center gap-3 md:flex">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="app-button-primary"
                                    >
                                        Ouvrir le dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="app-button-secondary"
                                        >
                                            Connexion
                                        </Link>
                                        {canRegister ? (
                                            <Link
                                                href={register()}
                                                className="app-button-accent"
                                            >
                                                Creer mon espace
                                            </Link>
                                        ) : null}
                                    </>
                                )}
                            </div>

                            <button
                                type="button"
                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-950 transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
                                aria-expanded={isMobileMenuOpen}
                                aria-label={
                                    isMobileMenuOpen
                                        ? 'Fermer le menu'
                                        : 'Ouvrir le menu'
                                }
                                onClick={() =>
                                    setIsMobileMenuOpen((open) => !open)
                                }
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </nav>

                        {isMobileMenuOpen ? (
                            <div className="mt-4 space-y-4 rounded-3xl border border-slate-200 bg-white p-4 md:hidden">
                                <div className="space-y-2">
                                    {navigationItems.map((item) => (
                                        <a
                                            key={item.href}
                                            href={item.href}
                                            className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="app-button-primary w-full justify-center"
                                        >
                                            Ouvrir le dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="app-button-secondary w-full justify-center"
                                            >
                                                Connexion
                                            </Link>
                                            {canRegister ? (
                                                <Link
                                                    href={register()}
                                                    className="app-button-accent w-full justify-center"
                                                >
                                                    Creer mon espace
                                                </Link>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </header>

                    <main className="pt-8">
                        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="rounded-[34px] border border-slate-200/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.65)] sm:px-8 sm:py-10">
                                <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold tracking-[0.28em] text-amber-200">
                                    SAAS DE GESTION COMMERCIALE
                                    MULTI-ORGANISATION
                                </span>
                                <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                    Pilotez vos ventes, votre stock, votre
                                    caisse et votre equipe dans une seule
                                    plateforme.
                                </h1>
                                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                    Kitunga permet a chaque entreprise de
                                    travailler dans son propre espace, d inviter
                                    ses collaborateurs, d attribuer des roles
                                    clairs et de gerer son abonnement via
                                    CinetPay sans melanger ses donnees avec
                                    celles d une autre organisation.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="app-button-accent"
                                        >
                                            Aller a mon espace
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={register()}
                                                className="app-button-accent"
                                            >
                                                Creer mon espace entreprise
                                            </Link>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                                            >
                                                Se connecter
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                    {[
                                        [
                                            '100%',
                                            'Donnees isolees',
                                            'from-amber-400 to-orange-400',
                                        ],
                                        [
                                            '4+',
                                            'Roles operationnels',
                                            'from-teal-400 to-cyan-400',
                                        ],
                                        [
                                            'CinetPay',
                                            'Paiement abonnement',
                                            'from-slate-700 to-slate-900',
                                        ],
                                    ].map(([value, label, accent]) => (
                                        <div
                                            key={label}
                                            className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur"
                                        >
                                            <div
                                                className={`h-1.5 w-16 rounded-full bg-linear-to-r ${accent}`}
                                            />
                                            <p className="mt-4 text-3xl font-extrabold">
                                                {value}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-300">
                                                {label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-5">
                                <div className="rounded-4xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.4)]">
                                    <p className="text-xs font-semibold tracking-[0.26em] text-slate-400 uppercase">
                                        Pour qui
                                    </p>
                                    <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
                                        Une solution pensee pour les commerces
                                        qui veulent structurer leur croissance.
                                    </h2>
                                    <div className="mt-6 space-y-3">
                                        {[
                                            'Boutiques et points de vente',
                                            'Superettes et commerces de proximite',
                                            'Pharmacies et quincailleries',
                                            'Entreprises avec plusieurs collaborateurs',
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-700"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-4xl border border-amber-200/60 bg-linear-to-br from-amber-100 via-white to-orange-50 p-6 shadow-[0_24px_70px_-45px_rgba(180,83,9,0.35)]">
                                    <p className="text-sm font-semibold tracking-[0.26em] text-amber-700/70 uppercase">
                                        Collaboration securisee
                                    </p>
                                    <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
                                        Un compte entreprise, plusieurs
                                        collaborateurs, des droits bien definis.
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-slate-600">
                                        L acheteur devient admin, invite son
                                        equipe et distribue les roles sans
                                        melanger les donnees d une autre
                                        organisation.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section id="modules" className="pt-20">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="max-w-2xl">
                                    <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                                        Modules
                                    </p>
                                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                        Tout ce qu il faut pour vendre, suivre
                                        et piloter dans un meme SaaS.
                                    </h2>
                                </div>
                                <p className="max-w-xl text-sm leading-7 text-slate-600">
                                    Le produit relie les operations terrain, la
                                    supervision, la gestion d equipe et la
                                    logique d abonnement.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                {modules.map(([title, description, Icon]) => (
                                    <article
                                        key={title}
                                        className="rounded-[28px] border border-slate-200/70 bg-white/92 p-6 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)] transition duration-200 hover:-translate-y-1"
                                    >
                                        <div className="w-fit rounded-2xl bg-slate-950 p-3 text-white">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-5 text-xl font-bold text-slate-950">
                                            {title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">
                                            {description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section id="saas" className="pt-20">
                            <div className="rounded-[34px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_26px_80px_-50px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="max-w-2xl">
                                        <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                                            Fonctionnalites SaaS
                                        </p>
                                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                            Une architecture faite pour servir
                                            plusieurs entreprises sans
                                            confusion.
                                        </h2>
                                    </div>
                                    <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
                                        <p className="text-sm text-slate-300">
                                            Paiement local
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            Abonnement via CinetPay
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-10 grid gap-5 lg:grid-cols-3">
                                    {saasFeatures.map(
                                        ([
                                            eyebrow,
                                            title,
                                            description,
                                            Icon,
                                        ]) => (
                                            <div
                                                key={title}
                                                className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-6"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-2xl bg-white p-3 text-slate-900 shadow-sm">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                                                        {eyebrow}
                                                    </span>
                                                </div>
                                                <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">
                                                    {title}
                                                </h3>
                                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                                    {description}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </section>

                        <section id="plans" className="pt-20">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="max-w-2xl">
                                    <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                                        Plans
                                    </p>
                                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                        Choisissez le niveau adapte a votre
                                        organisation.
                                    </h2>
                                </div>
                                <p className="max-w-xl text-sm leading-7 text-slate-600">
                                    Commencez avec une petite equipe ou passez a
                                    un plan plus large a mesure que votre
                                    activite grandit.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-5 lg:grid-cols-3">
                                {plans.map(([name, price, items]) => (
                                    <article
                                        key={name}
                                        className="rounded-[30px] border border-slate-200/70 bg-white/92 p-6 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xl font-extrabold text-slate-950">
                                                    {name}
                                                </p>
                                                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                                                    {price}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-slate-950 p-3 text-white">
                                                <BarChart3 className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="mt-6 space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700"
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="py-20">
                            <div className="rounded-[34px] border border-slate-200/70 bg-slate-950 px-6 py-8 text-white shadow-[0_32px_90px_-50px_rgba(15,23,42,0.65)] sm:px-8 sm:py-10">
                                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.28em] text-amber-200 uppercase">
                                            Passage a l action
                                        </p>
                                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                            Lancez votre espace entreprise et
                                            structurez enfin vos operations sur
                                            une base solide.
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                            Ventes, stock, caisse,
                                            collaborateurs et abonnement sont
                                            regroupes dans un seul produit pense
                                            pour le terrain et la supervision.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                                            <p className="text-sm text-slate-300">
                                                Confiance
                                            </p>
                                            <p className="mt-2 text-2xl font-extrabold">
                                                Donnees separees
                                            </p>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Chaque organisation garde son
                                                propre espace.
                                            </p>
                                        </div>
                                        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                                            <p className="text-sm text-slate-300">
                                                Activation
                                            </p>
                                            <p className="mt-2 text-2xl font-extrabold">
                                                Rapide
                                            </p>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Creation d organisation,
                                                invitation d equipe, paiement,
                                                puis demarrage.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="app-button-accent"
                                        >
                                            Ouvrir mon dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={register()}
                                                className="app-button-accent"
                                            >
                                                Creer mon espace entreprise
                                            </Link>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                                            >
                                                Se connecter
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
