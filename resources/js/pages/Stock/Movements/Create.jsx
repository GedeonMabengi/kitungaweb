import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import stockMovementRoutes from '@/routes/stock/movements';

export default function StockMovementCreate({ articles }) {
    const form = useForm({
        article_id: '',
        movement_type: 'IN',
        quantity: 1,
        quantity_type: 'UNIT',
        reason: '',
        reference: '',
        notes: '',
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(stockMovementRoutes.store.url());
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Stock</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Mouvement manuel de stock
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Saisis une entree, une sortie ou un ajustement
                            manuel sur un article.
                        </p>
                    </div>
                    <Link
                        href={stockMovementRoutes.index()}
                        className="app-button-secondary"
                    >
                        Retour a l'historique
                    </Link>
                </div>
            }
        >
            <Head title="Nouveau mouvement de stock" />

            <form onSubmit={submit} className="app-card space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Article
                        </label>
                        <select
                            value={form.data.article_id}
                            onChange={(event) =>
                                form.setData('article_id', event.target.value)
                            }
                            className="app-select"
                            required
                        >
                            <option value="">Choisir un article</option>
                            {articles.map((article) => (
                                <option key={article.id} value={article.id}>
                                    {article.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.article_id ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.article_id}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Type de mouvement
                        </label>
                        <select
                            value={form.data.movement_type}
                            onChange={(event) =>
                                form.setData(
                                    'movement_type',
                                    event.target.value,
                                )
                            }
                            className="app-select"
                        >
                            <option value="IN">Entree</option>
                            <option value="OUT">Sortie</option>
                            <option value="ADJUSTMENT">Ajustement</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Quantite
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={form.data.quantity}
                            onChange={(event) =>
                                form.setData('quantity', event.target.value)
                            }
                            className="app-input"
                            required
                        />
                        {form.errors.quantity ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.quantity}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Unite
                        </label>
                        <select
                            value={form.data.quantity_type}
                            onChange={(event) =>
                                form.setData(
                                    'quantity_type',
                                    event.target.value,
                                )
                            }
                            className="app-select"
                        >
                            <option value="UNIT">Unite</option>
                            <option value="PACK">Pack</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Motif
                        </label>
                        <input
                            type="text"
                            value={form.data.reason}
                            onChange={(event) =>
                                form.setData('reason', event.target.value)
                            }
                            className="app-input"
                            required
                        />
                        {form.errors.reason ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.reason}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Reference
                        </label>
                        <input
                            type="text"
                            value={form.data.reference}
                            onChange={(event) =>
                                form.setData('reference', event.target.value)
                            }
                            className="app-input"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Notes
                        </label>
                        <textarea
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            className="app-textarea"
                            rows="4"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="app-button-accent"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Enregistrement...'
                            : 'Enregistrer le mouvement'}
                    </button>
                    <Link
                        href={stockMovementRoutes.index()}
                        className="app-button-secondary"
                    >
                        Annuler
                    </Link>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
