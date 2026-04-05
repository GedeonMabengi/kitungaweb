import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import categoryRoutes from '@/routes/categories';

export default function CategoryForm({ category = null, mode = 'create' }) {
    const isEditing = mode === 'edit';

    const form = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        image: null,
        is_active: category?.is_active ?? true,
    });

    const submit = (event) => {
        event.preventDefault();

        if (isEditing) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            })).post(categoryRoutes.update.url(category.id), {
                forceFormData: true,
            });

            return;
        }

        form.post(categoryRoutes.store.url(), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Categories</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {isEditing
                                ? 'Modifier la categorie'
                                : 'Creer une categorie'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Definis une famille de produits avec son statut et
                            sa description.
                        </p>
                    </div>
                    <Link
                        href={categoryRoutes.index()}
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
                        {form.errors.image ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.image}
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
                                form.setData('description', event.target.value)
                            }
                            className="app-textarea"
                            rows="5"
                        />
                        {form.errors.description ? (
                            <p className="mt-2 text-sm text-rose-600">
                                {form.errors.description}
                            </p>
                        ) : null}
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={Boolean(form.data.is_active)}
                            onChange={(event) =>
                                form.setData('is_active', event.target.checked)
                            }
                        />
                        Categorie active
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
                              : 'Creer la categorie'}
                    </button>
                    <Link
                        href={categoryRoutes.index()}
                        className="app-button-secondary"
                    >
                        Annuler
                    </Link>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
