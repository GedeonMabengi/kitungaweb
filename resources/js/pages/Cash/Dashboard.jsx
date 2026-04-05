import { Head, useForm } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Banknote,
    CircleDollarSign,
    Lock,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthorization } from '@/lib/authorization';
import { useOrganizationCurrency } from '@/lib/currency';
import cashRoutes from '@/routes/cash';

function ActionCard({ title, description, icon: Icon, children }) {
    return (
        <div className="app-card">
            <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-950">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            <div className="mt-5">{children}</div>
        </div>
    );
}

export default function CashDashboard({
    openRegister,
    hasOpenRegister,
    todayStats,
    previousClosedRegister,
}) {
    const { formatCurrency } = useOrganizationCurrency();
    const { hasPermission } = useAuthorization();
    const [activePanel, setActivePanel] = useState(null);
    const hasActiveRegister = Boolean(openRegister?.id) && hasOpenRegister;
    const canOpenRegister = hasPermission('cash.open');
    const canCloseRegister = hasPermission('cash.close');
    const canAddInput = hasPermission('cash.input');
    const canAddOutput = hasPermission('cash.output');
    const previousClosingBalance =
        previousClosedRegister?.actual_balance != null
            ? String(previousClosedRegister.actual_balance)
            : '';

    const openForm = useForm({
        opening_balance: previousClosingBalance,
        notes: '',
    });
    const closeForm = useForm({ actual_balance: '', notes: '' });
    const inputForm = useForm({
        amount: '',
        source: 'DEPOSIT',
        reference: '',
        notes: '',
    });
    const outputForm = useForm({
        amount: '',
        reason: '',
        beneficiary: '',
        reference: '',
        notes: '',
    });

    const currentBalance = useMemo(() => {
        if (todayStats?.current_balance !== undefined) {
            return Number(todayStats.current_balance);
        }

        return (
            Number(openRegister?.opening_balance || 0) +
            Number(openRegister?.total_input || 0) -
            Number(openRegister?.total_output || 0)
        );
    }, [openRegister, todayStats]);

    useEffect(() => {
        if (
            !hasActiveRegister &&
            previousClosingBalance &&
            !openForm.data.opening_balance
        ) {
            openForm.setData('opening_balance', previousClosingBalance);
        }
    }, [
        hasActiveRegister,
        openForm,
        openForm.data.opening_balance,
        previousClosingBalance,
    ]);

    const submitOpen = (event) => {
        event.preventDefault();
        openForm.post(cashRoutes.open.url(), {
            onSuccess: () => {
                setActivePanel(null);
                openForm.reset();
            },
        });
    };

    const submitClose = (event) => {
        event.preventDefault();

        if (!openRegister?.id) {
            return;
        }

        closeForm.post(cashRoutes.close.url(openRegister.id), {
            onSuccess: () => {
                setActivePanel(null);
                closeForm.reset();
            },
        });
    };

    const submitInput = (event) => {
        event.preventDefault();

        if (!openRegister?.id) {
            return;
        }

        inputForm.post(cashRoutes.input.url(openRegister.id), {
            onSuccess: () => {
                setActivePanel(null);
                inputForm.reset();
            },
        });
    };

    const submitOutput = (event) => {
        event.preventDefault();

        if (!openRegister?.id) {
            return;
        }

        outputForm.post(cashRoutes.output.url(openRegister.id), {
            onSuccess: () => {
                setActivePanel(null);
                outputForm.reset();
            },
        });
    };

    const movements = [
        ...(openRegister?.inputs || []),
        ...(openRegister?.outputs || []),
    ]
        .sort(
            (left, right) =>
                new Date(right.created_at) - new Date(left.created_at),
        )
        .slice(0, 10);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Caisse</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Pilotage des flux de caisse
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Ouvre, alimente, debourse puis cloture la caisse
                            dans une interface orientee usage quotidien.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-lg">
                        <p className="text-xs text-slate-300">Solde courant</p>
                        <p className="mt-1 text-xl font-extrabold">
                            {formatCurrency(currentBalance)}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Gestion de caisse" />

            {!hasActiveRegister ? (
                <section className="app-shell-bg overflow-hidden p-6 sm:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <div className="inline-flex rounded-3xl bg-amber-100 p-4 text-amber-700">
                                <Banknote className="h-8 w-8" />
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950">
                                Aucune caisse ouverte
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                                Demarre la journee avec un solde initial, puis
                                ajoute les entrees et sorties au fil des
                                operations.
                            </p>
                            {previousClosedRegister ? (
                                <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
                                        Derniere cloture
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-slate-950">
                                        {formatCurrency(
                                            previousClosedRegister.actual_balance,
                                        )}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Solde reel cloture le{' '}
                                        {previousClosedRegister.date || '-'}. Tu
                                        peux le reprendre comme montant
                                        d'ouverture aujourd'hui.
                                    </p>
                                </div>
                            ) : null}
                            {canOpenRegister ? (
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        className="app-button-accent"
                                        onClick={() =>
                                            setActivePanel(
                                                activePanel === 'open'
                                                    ? null
                                                    : 'open',
                                            )
                                        }
                                    >
                                        Ouvrir la caisse
                                    </button>
                                </div>
                            ) : null}
                        </div>
                        <ActionCard
                            title="Ouverture"
                            description="Saisis le montant de depart et une note si necessaire."
                            icon={Wallet}
                        >
                            {canOpenRegister && activePanel === 'open' ? (
                                <form
                                    onSubmit={submitOpen}
                                    className="space-y-4"
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={openForm.data.opening_balance}
                                        onChange={(event) =>
                                            openForm.setData(
                                                'opening_balance',
                                                event.target.value,
                                            )
                                        }
                                        className="app-input"
                                        placeholder="Solde initial"
                                        required
                                    />
                                    {previousClosedRegister ? (
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                            onClick={() =>
                                                openForm.setData(
                                                    'opening_balance',
                                                    previousClosingBalance,
                                                )
                                            }
                                        >
                                            Reprendre le solde precedent (
                                            {formatCurrency(
                                                previousClosedRegister.actual_balance,
                                            )}
                                            )
                                        </button>
                                    ) : null}
                                    <textarea
                                        value={openForm.data.notes}
                                        onChange={(event) =>
                                            openForm.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                        className="app-textarea"
                                        rows="4"
                                        placeholder="Notes"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="app-button-primary"
                                            disabled={openForm.processing}
                                        >
                                            {openForm.processing
                                                ? 'Ouverture...'
                                                : 'Confirmer'}
                                        </button>
                                        <button
                                            type="button"
                                            className="app-button-secondary"
                                            onClick={() => setActivePanel(null)}
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                                    {canOpenRegister
                                        ? 'Lance l ouverture pour afficher le formulaire.'
                                        : 'Ce profil ne peut pas ouvrir une caisse depuis cette interface.'}
                                </p>
                            )}
                        </ActionCard>
                    </div>
                </section>
            ) : (
                <div className="space-y-6">
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="app-stat-card">
                            <p className="text-sm text-slate-500">
                                Solde initial
                            </p>
                            <p className="mt-3 text-3xl font-extrabold text-slate-950">
                                {formatCurrency(
                                    todayStats?.opening_balance ??
                                        openRegister?.opening_balance ??
                                        0,
                                )}
                            </p>
                        </div>
                        <div className="app-stat-card">
                            <p className="text-sm text-slate-500">Entrees</p>
                            <p className="mt-3 text-3xl font-extrabold text-emerald-700">
                                {formatCurrency(
                                    todayStats?.total_input ??
                                        openRegister?.total_input ??
                                        0,
                                )}
                            </p>
                        </div>
                        <div className="app-stat-card">
                            <p className="text-sm text-slate-500">Sorties</p>
                            <p className="mt-3 text-3xl font-extrabold text-rose-700">
                                {formatCurrency(
                                    todayStats?.total_output ??
                                        openRegister?.total_output ??
                                        0,
                                )}
                            </p>
                        </div>
                        <div className="app-stat-card">
                            <p className="text-sm text-slate-500">Disponible</p>
                            <p className="mt-3 text-3xl font-extrabold text-slate-950">
                                {formatCurrency(currentBalance)}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="grid gap-6 md:grid-cols-2">
                            {canAddInput ? (
                                <ActionCard
                                    title="Ajouter une entree"
                                    description="Enregistre un depot ou un autre apport."
                                    icon={ArrowDownLeft}
                                >
                                    {activePanel === 'input' ? (
                                        <form
                                            onSubmit={submitInput}
                                            className="space-y-4"
                                        >
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={inputForm.data.amount}
                                                onChange={(event) =>
                                                    inputForm.setData(
                                                        'amount',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-input"
                                                placeholder="Montant"
                                                required
                                            />
                                            <select
                                                value={inputForm.data.source}
                                                onChange={(event) =>
                                                    inputForm.setData(
                                                        'source',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-select"
                                            >
                                                <option value="DEPOSIT">
                                                    Depot
                                                </option>
                                                <option value="REFUND">
                                                    Remboursement
                                                </option>
                                                <option value="OTHER">
                                                    Autre
                                                </option>
                                            </select>
                                            <input
                                                type="text"
                                                value={inputForm.data.reference}
                                                onChange={(event) =>
                                                    inputForm.setData(
                                                        'reference',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-input"
                                                placeholder="Reference"
                                            />
                                            <textarea
                                                value={inputForm.data.notes}
                                                onChange={(event) =>
                                                    inputForm.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-textarea"
                                                rows="3"
                                                placeholder="Notes"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="app-button-primary"
                                                    disabled={
                                                        inputForm.processing
                                                    }
                                                >
                                                    Ajouter
                                                </button>
                                                <button
                                                    type="button"
                                                    className="app-button-secondary"
                                                    onClick={() =>
                                                        setActivePanel(null)
                                                    }
                                                >
                                                    Fermer
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            type="button"
                                            className="app-button-secondary w-full"
                                            onClick={() =>
                                                setActivePanel('input')
                                            }
                                        >
                                            Nouvelle entree
                                        </button>
                                    )}
                                </ActionCard>
                            ) : null}
                            {canAddOutput ? (
                                <ActionCard
                                    title="Ajouter une sortie"
                                    description="Trace un deboursement avec motif et reference."
                                    icon={ArrowUpRight}
                                >
                                    {activePanel === 'output' ? (
                                        <form
                                            onSubmit={submitOutput}
                                            className="space-y-4"
                                        >
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={outputForm.data.amount}
                                                onChange={(event) =>
                                                    outputForm.setData(
                                                        'amount',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-input"
                                                placeholder="Montant"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={outputForm.data.reason}
                                                onChange={(event) =>
                                                    outputForm.setData(
                                                        'reason',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-input"
                                                placeholder="Motif"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={
                                                    outputForm.data.beneficiary
                                                }
                                                onChange={(event) =>
                                                    outputForm.setData(
                                                        'beneficiary',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-input"
                                                placeholder="Beneficiaire"
                                            />
                                            <input
                                                type="text"
                                                value={
                                                    outputForm.data.reference
                                                }
                                                onChange={(event) =>
                                                    outputForm.setData(
                                                        'reference',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-input"
                                                placeholder="Reference"
                                            />
                                            <textarea
                                                value={outputForm.data.notes}
                                                onChange={(event) =>
                                                    outputForm.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-textarea"
                                                rows="3"
                                                placeholder="Notes"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="app-button-primary"
                                                    disabled={
                                                        outputForm.processing
                                                    }
                                                >
                                                    Ajouter
                                                </button>
                                                <button
                                                    type="button"
                                                    className="app-button-secondary"
                                                    onClick={() =>
                                                        setActivePanel(null)
                                                    }
                                                >
                                                    Fermer
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            type="button"
                                            className="app-button-secondary w-full"
                                            onClick={() =>
                                                setActivePanel('output')
                                            }
                                        >
                                            Nouvelle sortie
                                        </button>
                                    )}
                                </ActionCard>
                            ) : null}
                            {canCloseRegister ? (
                                <ActionCard
                                    title="Cloturer"
                                    description="Compare le solde attendu au solde reel."
                                    icon={Lock}
                                >
                                    {activePanel === 'close' ? (
                                        <form
                                            onSubmit={submitClose}
                                            className="space-y-4"
                                        >
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={
                                                    closeForm.data
                                                        .actual_balance
                                                }
                                                onChange={(event) =>
                                                    closeForm.setData(
                                                        'actual_balance',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-input"
                                                placeholder="Solde reel"
                                                required
                                            />
                                            <textarea
                                                value={closeForm.data.notes}
                                                onChange={(event) =>
                                                    closeForm.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                className="app-textarea"
                                                rows="3"
                                                placeholder="Notes de cloture"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="app-button-primary"
                                                    disabled={
                                                        closeForm.processing
                                                    }
                                                >
                                                    Cloturer
                                                </button>
                                                <button
                                                    type="button"
                                                    className="app-button-secondary"
                                                    onClick={() =>
                                                        setActivePanel(null)
                                                    }
                                                >
                                                    Fermer
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            type="button"
                                            className="app-button-secondary w-full"
                                            onClick={() =>
                                                setActivePanel('close')
                                            }
                                        >
                                            Lancer la cloture
                                        </button>
                                    )}
                                </ActionCard>
                            ) : null}
                            <div className="app-card bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-white/10 p-3">
                                        <CircleDollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-300">
                                            Synthese
                                        </p>
                                        <h3 className="mt-1 text-xl font-bold">
                                            Flux du jour
                                        </h3>
                                    </div>
                                </div>
                                <div className="mt-5 space-y-3 text-sm text-slate-300">
                                    <div className="flex items-center justify-between">
                                        <span>Ouverture</span>
                                        <span className="font-semibold text-white">
                                            {formatCurrency(
                                                openRegister?.opening_balance ??
                                                    0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Entrees</span>
                                        <span className="font-semibold text-white">
                                            {formatCurrency(
                                                openRegister?.total_input ?? 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Sorties</span>
                                        <span className="font-semibold text-white">
                                            {formatCurrency(
                                                openRegister?.total_output ?? 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                        <span>Disponible</span>
                                        <span className="text-lg font-extrabold text-white">
                                            {formatCurrency(currentBalance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="app-card">
                            <h2 className="text-xl font-bold text-slate-950">
                                Historique du jour
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Consulte rapidement les derniers mouvements
                                enregistres sur la caisse ouverte.
                            </p>
                            <div className="mt-6 space-y-3">
                                {movements.length ? (
                                    movements.map((movement) => {
                                        const isInput = 'source' in movement;
                                        return (
                                            <div
                                                key={`${isInput ? 'input' : 'output'}-${movement.id}`}
                                                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-950">
                                                            {isInput
                                                                ? movement.source ||
                                                                  'Entree'
                                                                : movement.reason ||
                                                                  'Sortie'}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {movement.reference ||
                                                                movement.notes ||
                                                                'Sans details'}
                                                        </p>
                                                        {isInput &&
                                                        movement.sale ? (
                                                            <p className="mt-2 text-sm text-slate-500">
                                                                Vente{' '}
                                                                {
                                                                    movement
                                                                        .sale
                                                                        .reference
                                                                }{' '}
                                                                -{' '}
                                                                {movement.sale
                                                                    .user
                                                                    ?.name ||
                                                                    'Vendeur'}
                                                            </p>
                                                        ) : null}
                                                        {isInput &&
                                                        movement.sale?.items
                                                            ?.length ? (
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {movement.sale.items
                                                                    .map(
                                                                        (
                                                                            item,
                                                                        ) =>
                                                                            item
                                                                                .article
                                                                                ?.name ||
                                                                            'Article',
                                                                    )
                                                                    .join(', ')}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <span
                                                        className={`text-sm font-bold ${isInput ? 'text-emerald-700' : 'text-rose-700'}`}
                                                    >
                                                        {isInput ? '+' : '-'}
                                                        {formatCurrency(
                                                            movement.amount,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                        Aucun mouvement enregistre pour le
                                        moment.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
