import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import articleRoutes from '@/routes/articles';

function normalizeDate(value) {
    if (!value) {
        return '';
    }

    return String(value).slice(0, 10);
}

export default function ArticleForm({ article = null, categories = [], mode }) {
    const isEditing = mode === 'edit';
    const existingImageUrl = article?.image
        ? `/storage/${article.image}`
        : null;
    const [previewUrl, setPreviewUrl] = useState(existingImageUrl);

    const form = useForm({
        name: article?.name ?? '',
        category_id: article?.category_id ?? '',
        description: article?.description ?? '',
        price: article?.price ?? '',
        cost_price: article?.cost_price ?? '',
        unit_type: article?.unit_type ?? 'UNIT',
        units_per_pack: article?.units_per_pack ?? '',
        unit_price: article?.unit_price ?? '',
        initial_quantity: article?.initial_quantity ?? 0,
        alert_threshold: article?.alert_threshold ?? 10,
        expiration_date: normalizeDate(article?.expiration_date),
        image: null,
        is_active: article?.is_active ?? true,
        allow_unit_sale: article?.allow_unit_sale ?? false,
        barcode: article?.barcode ?? '',
    });

    useEffect(() => {
        if (!form.data.image) {
            setPreviewUrl(existingImageUrl);
            return undefined;
        }

        const localPreview = URL.createObjectURL(form.data.image);
        setPreviewUrl(localPreview);

        return () => {
            URL.revokeObjectURL(localPreview);
        };
    }, [existingImageUrl, form.data.image]);

    const submit = (event) => {
        event.preventDefault();

        form.transform((data) => {
            const normalizedData = {
                ...data,
                category_id: data.category_id || null,
                cost_price: data.cost_price || null,
                units_per_pack:
                    data.unit_type === 'PACK'
                        ? data.units_per_pack || null
                        : null,
                unit_price:
                    data.unit_type === 'PACK' ? data.unit_price || null : null,
                expiration_date: data.expiration_date || null,
                barcode: data.barcode || null,
                allow_unit_sale:
                    data.unit_type === 'PACK'
                        ? Boolean(data.allow_unit_sale)
                        : false,
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
            form.post(articleRoutes.update.url(article.id), {
                forceFormData: true,
            });

            return;
        }

        form.post(articleRoutes.store.url(), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Articles</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {isEditing
                                ? 'Modifier un article'
                                : 'Creer un nouvel article'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Renseigne les informations commerciales, les regles
                            de vente et les parametres de stock.
                        </p>
                    </div>
                    <Link
                        href={articleRoutes.index()}
                        className="app-button-secondary"
                    >
                        Retour a la liste
                    </Link>
                </div>
            }
        >
            <div className="space-y-6">
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
                                Categorie
                            </label>
                            <select
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData(
                                        'category_id',
                                        event.target.value,
                                    )
                                }
                                className="app-select"
                            >
                                <option value="">Sans categorie</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {categories.length === 0 ? (
                                <p className="mt-2 text-sm text-amber-700">
                                    Aucune categorie active n&apos;est
                                    disponible pour votre organisation.
                                </p>
                            ) : null}
                            {form.errors.category_id ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.category_id}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Prix de vente
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.price}
                                onChange={(event) =>
                                    form.setData('price', event.target.value)
                                }
                                className="app-input"
                                required
                            />
                            {form.errors.price ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.price}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Prix d'achat
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.cost_price}
                                onChange={(event) =>
                                    form.setData(
                                        'cost_price',
                                        event.target.value,
                                    )
                                }
                                className="app-input"
                            />
                            {form.errors.cost_price ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.cost_price}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Type d'unite
                            </label>
                            <select
                                value={form.data.unit_type}
                                onChange={(event) =>
                                    form.setData(
                                        'unit_type',
                                        event.target.value,
                                    )
                                }
                                className="app-select"
                            >
                                <option value="UNIT">Unite</option>
                                <option value="PACK">Pack</option>
                            </select>
                            {form.errors.unit_type ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.unit_type}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Code-barres
                            </label>
                            <input
                                type="text"
                                value={form.data.barcode}
                                onChange={(event) =>
                                    form.setData('barcode', event.target.value)
                                }
                                className="app-input"
                            />
                            {form.errors.barcode ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.barcode}
                                </p>
                            ) : null}
                        </div>

                        {form.data.unit_type === 'PACK' ? (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Unites par pack
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.units_per_pack}
                                        onChange={(event) =>
                                            form.setData(
                                                'units_per_pack',
                                                event.target.value,
                                            )
                                        }
                                        className="app-input"
                                    />
                                    {form.errors.units_per_pack ? (
                                        <p className="mt-2 text-sm text-rose-600">
                                            {form.errors.units_per_pack}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Prix a l'unite
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.unit_price}
                                        onChange={(event) =>
                                            form.setData(
                                                'unit_price',
                                                event.target.value,
                                            )
                                        }
                                        className="app-input"
                                    />
                                    {form.errors.unit_price ? (
                                        <p className="mt-2 text-sm text-rose-600">
                                            {form.errors.unit_price}
                                        </p>
                                    ) : null}
                                </div>
                            </>
                        ) : null}

                        {!isEditing ? (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Stock initial
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.data.initial_quantity}
                                    onChange={(event) =>
                                        form.setData(
                                            'initial_quantity',
                                            event.target.value,
                                        )
                                    }
                                    className="app-input"
                                    required
                                />
                                {form.errors.initial_quantity ? (
                                    <p className="mt-2 text-sm text-rose-600">
                                        {form.errors.initial_quantity}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Seuil d'alerte
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.data.alert_threshold}
                                onChange={(event) =>
                                    form.setData(
                                        'alert_threshold',
                                        event.target.value,
                                    )
                                }
                                className="app-input"
                                required
                            />
                            {form.errors.alert_threshold ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.alert_threshold}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Date d'expiration
                            </label>
                            <input
                                type="date"
                                value={form.data.expiration_date}
                                onChange={(event) =>
                                    form.setData(
                                        'expiration_date',
                                        event.target.value,
                                    )
                                }
                                className="app-input"
                            />
                            {form.errors.expiration_date ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.expiration_date}
                                </p>
                            ) : null}
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Description
                            </label>
                            <textarea
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="app-textarea"
                                rows="4"
                            />
                            {form.errors.description ? (
                                <p className="mt-2 text-sm text-rose-600">
                                    {form.errors.description}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:col-span-2 lg:grid-cols-[1fr_220px]">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        form.setData(
                                            'image',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="app-input"
                                />
                                <p className="mt-2 text-sm text-slate-500">
                                    L&apos;aper�u s&apos;affiche ici avant
                                    l&apos;enregistrement.
                                </p>
                                {form.errors.image ? (
                                    <p className="mt-2 text-sm text-rose-600">
                                        {form.errors.image}
                                    </p>
                                ) : null}
                            </div>
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Apercu du produit"
                                        className="h-full min-h-44 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex min-h-44 items-center justify-center px-4 text-center text-sm text-slate-500">
                                        Aucun apercu disponible.
                                    </div>
                                )}
                            </div>
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={Boolean(form.data.is_active)}
                                onChange={(event) =>
                                    form.setData(
                                        'is_active',
                                        event.target.checked,
                                    )
                                }
                            />
                            Article actif
                        </label>

                        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={Boolean(form.data.allow_unit_sale)}
                                onChange={(event) =>
                                    form.setData(
                                        'allow_unit_sale',
                                        event.target.checked,
                                    )
                                }
                            />
                            Vente a l'unite autorisee
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
                                  : 'Creer l article'}
                        </button>
                        <Link
                            href={articleRoutes.index()}
                            className="app-button-secondary"
                        >
                            Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
