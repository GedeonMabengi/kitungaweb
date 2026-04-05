import { Head, Link, router } from '@inertiajs/react';
import {
    CreditCard,
    Minus,
    Package,
    Plus,
    ScanSearch,
    ShoppingCart,
    Trash2,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useOrganizationCurrency } from '@/lib/currency';
import cashRoutes from '@/routes/cash';
import salesRoutes from '@/routes/sales';

function resolveUnitPrice(article, quantityType) {
    if (quantityType === 'PACK') {
        return Number(article.price || 0);
    }

    if (article.unit_type === 'PACK') {
        return Number(
            article.unit_price ||
                Number(article.price || 0) /
                    Number(article.units_per_pack || 1),
        );
    }

    return Number(article.price || 0);
}

export default function POS({
    articles,
    categories,
    cashRegister,
    hasCashRegister,
}) {
    const { formatCurrency } = useOrganizationCurrency();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [amountPaid, setAmountPaid] = useState('');
    const [discount, setDiscount] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [processing, setProcessing] = useState(false);

    const filteredArticles = useMemo(() => {
        return articles.filter((article) => {
            const matchesSearch =
                article.name.toLowerCase().includes(search.toLowerCase()) ||
                article.sku?.toLowerCase().includes(search.toLowerCase()) ||
                article.barcode?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory =
                !selectedCategory ||
                String(article.category_id) === String(selectedCategory);

            return matchesSearch && matchesCategory;
        });
    }, [articles, search, selectedCategory]);

    const subtotal = useMemo(() => {
        return cart.reduce(
            (sum, item) => sum + item.quantity * item.unit_price,
            0,
        );
    }, [cart]);

    const total = useMemo(() => {
        return subtotal - Number(discount || 0);
    }, [discount, subtotal]);

    const change = useMemo(() => {
        return Math.max(0, Number(amountPaid || 0) - total);
    }, [amountPaid, total]);

    const addToCart = (
        article,
        quantityType = article.unit_type === 'PACK' ? 'PACK' : 'UNIT',
    ) => {
        setCart((currentCart) => {
            const existingIndex = currentCart.findIndex(
                (item) =>
                    item.article_id === article.id &&
                    item.quantity_type === quantityType,
            );

            if (existingIndex >= 0) {
                return currentCart.map((item, index) =>
                    index === existingIndex
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [
                ...currentCart,
                {
                    article_id: article.id,
                    article,
                    quantity: 1,
                    quantity_type: quantityType,
                    unit_price: resolveUnitPrice(article, quantityType),
                },
            ];
        });
    };

    const updateQuantity = (index, delta) => {
        setCart((currentCart) => {
            const updated = [...currentCart];
            updated[index] = {
                ...updated[index],
                quantity: updated[index].quantity + delta,
            };

            return updated[index].quantity <= 0
                ? updated.filter((_, itemIndex) => itemIndex !== index)
                : updated;
        });
    };

    const removeFromCart = (index) => {
        setCart((currentCart) =>
            currentCart.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const submitSale = () => {
        if (cart.length === 0) {
            window.alert('Le panier est vide.');
            return;
        }

        if (Number(amountPaid || 0) < total) {
            window.alert('Le montant paye est insuffisant.');
            return;
        }

        setProcessing(true);

        router.post(
            salesRoutes.store.url(),
            {
                items: cart.map((item) => ({
                    article_id: item.article_id,
                    quantity: item.quantity,
                    quantity_type: item.quantity_type,
                    unit_price: item.unit_price,
                })),
                payment_method: paymentMethod,
                amount_paid: Number(amountPaid || 0),
                discount: Number(discount || 0),
                customer_name: customerName,
                customer_phone: customerPhone,
            },
            {
                onSuccess: () => {
                    setCart([]);
                    setAmountPaid('');
                    setDiscount(0);
                    setCustomerName('');
                    setCustomerPhone('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Point de vente</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Encaissement rapide et fluide
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Recherche, ajout au panier, calcul du rendu et
                            validation de vente dans une interface orientee
                            comptoir.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-lg">
                        <p className="text-xs text-slate-300">Caisse active</p>
                        <p className="mt-1 text-xl font-extrabold">
                            {hasCashRegister
                                ? formatCurrency(cashRegister?.opening_balance)
                                : 'Indisponible'}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Point de vente" />

            {!hasCashRegister ? (
                <section className="app-shell-bg overflow-hidden p-6 sm:p-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mx-auto inline-flex rounded-3xl bg-amber-100 p-4 text-amber-700">
                            <ShoppingCart className="h-8 w-8" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950">
                            Ouvre une caisse avant de vendre
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                            Le point de vente reste bloque tant qu'aucune caisse
                            n'est ouverte pour votre organisation aujourd'hui.
                        </p>
                        <Link
                            href={cashRoutes.dashboard()}
                            className="app-button-accent mt-6"
                        >
                            Aller a la caisse
                        </Link>
                    </div>
                </section>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <section className="space-y-6">
                        <div className="app-card">
                            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                                <label className="relative block">
                                    <ScanSearch className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Nom, SKU, code-barres..."
                                        className="app-input pl-11"
                                    />
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(event) =>
                                        setSelectedCategory(event.target.value)
                                    }
                                    className="app-select"
                                >
                                    <option value="">Toutes categories</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                            {filteredArticles.map((article) => (
                                <article key={article.id} className="app-card">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-bold text-slate-950">
                                                {article.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {article.category?.name ||
                                                    'Sans categorie'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            Stock {article.current_stock}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-3">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs tracking-wide text-slate-400 uppercase">
                                                Prix
                                            </p>
                                            <p className="mt-2 text-xl font-extrabold text-slate-950">
                                                {formatCurrency(article.price)}
                                            </p>
                                            {article.unit_type === 'PACK' &&
                                            article.allow_unit_sale ? (
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Unite:{' '}
                                                    {formatCurrency(
                                                        resolveUnitPrice(
                                                            article,
                                                            'UNIT',
                                                        ),
                                                    )}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                className="app-button-primary flex-1"
                                                onClick={() =>
                                                    addToCart(
                                                        article,
                                                        article.unit_type ===
                                                            'PACK'
                                                            ? 'PACK'
                                                            : 'UNIT',
                                                    )
                                                }
                                            >
                                                <Package className="mr-2 h-4 w-4" />
                                                {article.unit_type === 'PACK'
                                                    ? 'Ajouter pack'
                                                    : 'Ajouter'}
                                            </button>

                                            {article.unit_type === 'PACK' &&
                                            article.allow_unit_sale ? (
                                                <button
                                                    type="button"
                                                    className="app-button-secondary flex-1"
                                                    onClick={() =>
                                                        addToCart(
                                                            article,
                                                            'UNIT',
                                                        )
                                                    }
                                                >
                                                    Ajouter unite
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="app-card sticky top-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Panier
                                    </p>
                                    <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                                        {cart.length} article(s)
                                    </h2>
                                </div>
                                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {cart.length > 0 ? (
                                    cart.map((item, index) => (
                                        <div
                                            key={`${item.article_id}-${item.quantity_type}`}
                                            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-slate-950">
                                                        {item.article.name}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {item.quantity_type} -{' '}
                                                        {formatCurrency(
                                                            item.unit_price,
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                                                    onClick={() =>
                                                        removeFromCart(index)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="rounded-xl border border-slate-200 p-2 text-slate-700"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                index,
                                                                -1,
                                                            )
                                                        }
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="min-w-10 text-center font-semibold text-slate-950">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="rounded-xl border border-slate-200 p-2 text-slate-700"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                index,
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="font-bold text-slate-950">
                                                    {formatCurrency(
                                                        item.quantity *
                                                            item.unit_price,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                        Le panier est vide.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
                                <div className="grid gap-4">
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(event) =>
                                            setCustomerName(event.target.value)
                                        }
                                        className="app-input"
                                        placeholder="Nom du client"
                                    />
                                    <input
                                        type="text"
                                        value={customerPhone}
                                        onChange={(event) =>
                                            setCustomerPhone(event.target.value)
                                        }
                                        className="app-input"
                                        placeholder="Telephone"
                                    />
                                    <select
                                        value={paymentMethod}
                                        onChange={(event) =>
                                            setPaymentMethod(event.target.value)
                                        }
                                        className="app-select"
                                    >
                                        <option value="CASH">Especes</option>
                                        <option value="CARD">Carte</option>
                                        <option value="MOBILE">
                                            Mobile money
                                        </option>
                                        <option value="CREDIT">Credit</option>
                                        <option value="OTHER">Autre</option>
                                    </select>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={discount}
                                        onChange={(event) =>
                                            setDiscount(event.target.value)
                                        }
                                        className="app-input"
                                        placeholder="Remise"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={amountPaid}
                                        onChange={(event) =>
                                            setAmountPaid(event.target.value)
                                        }
                                        className="app-input"
                                        placeholder="Montant paye"
                                    />
                                </div>

                                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                                    <div className="flex items-center justify-between text-sm text-slate-300">
                                        <span>Sous-total</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                                        <span>Remise</span>
                                        <span>{formatCurrency(discount)}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                                        <span>Rendu</span>
                                        <span>{formatCurrency(change)}</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                                        <span className="text-sm tracking-[0.2em] text-slate-400 uppercase">
                                            Total
                                        </span>
                                        <span className="text-2xl font-extrabold">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="app-button-accent w-full"
                                    disabled={processing}
                                    onClick={submitSale}
                                >
                                    {paymentMethod === 'CASH' ? (
                                        <Wallet className="mr-2 h-4 w-4" />
                                    ) : (
                                        <CreditCard className="mr-2 h-4 w-4" />
                                    )}
                                    {processing
                                        ? 'Validation...'
                                        : 'Valider la vente'}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
