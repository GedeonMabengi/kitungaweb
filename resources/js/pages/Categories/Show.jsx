import { Head, Link } from '@inertiajs/react';
import { FolderOpen } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import categoryRoutes from '@/routes/categories';

export default function CategoryShow({ category }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Categorie</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            {category.name}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Vue detaillee de la categorie et des articles qui y
                            sont rattaches.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={categoryRoutes.edit(category.id)}
                            className="app-button-accent"
                        >
                            Modifier
                        </Link>
                        <Link
                            href={categoryRoutes.index()}
                            className="app-button-secondary"
                        >
                            Retour
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={category.name} />

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="app-card space-y-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                Informations
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-slate-950">
                                Fiche categorie
                            </h2>
                        </div>
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                            <FolderOpen className="h-5 w-5" />
                        </div>
                    </div>

                    <dl className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm text-slate-500">Nom</dt>
                            <dd className="mt-1 font-semibold text-slate-950">
                                {category.name}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500">Statut</dt>
                            <dd className="mt-1 font-semibold text-slate-950">
                                {category.is_active ? 'Active' : 'Inactive'}
                            </dd>
                        </div>
                    </dl>

                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm leading-7 text-slate-600">
                            {category.description ||
                                'Aucune description enregistree.'}
                        </p>
                    </div>
                </section>

                <section className="app-card">
                    <h2 className="text-xl font-bold text-slate-950">
                        Articles lies
                    </h2>
                    <div className="mt-5 space-y-3">
                        {category.articles?.length ? (
                            category.articles.map((article) => (
                                <div
                                    key={article.id}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {article.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {article.sku ||
                                                    article.barcode ||
                                                    'Sans reference'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            Stock {article.current_stock}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                Aucun article rattache a cette categorie.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
