// src/screens/sales/PosScreen.tsx
import * as React from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    CheckCircle2,
    CreditCard,
    Minus,
    Package,
    Plus,
    Printer,
    ShoppingCart,
    Trash2,
    Wallet,
} from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetHeader,
    BottomSheetTitle,
} from '../../components/ui/BottomSheet';
import { FormField } from '../../components/forms/FormField';
import AlertError from '../../components/forms/AlertError';
import { useArticles } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';
import { useCashDashboard } from '../../hooks/useCash';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { useOrganizationStore } from '../../store/organization.store';
import { useSessionStore } from '../../store/session.store';
import { SalesRepo } from '../../data/repositories/sales.repo';
import {
    resolveUnitPrice,
    type PaymentMethod,
    type QuantityType,
} from '../../data/types/sale';
import type { ArticleRow } from '../../data/types/article';
import { PrinterService } from '../../lib/printerNative';
import { SystemPrinterService } from '../../lib/systemPrinter';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    dark: '#0F172A',
    emerald: '#047857',
    rose: '#B91C1C',
    amber: '#B45309',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

type CartLine = {
    article_id: number;
    article: ArticleRow;
    quantity: number;
    quantity_type: QuantityType;
    unit_price: number;
};

type SaleSuccess = {
    sale_id: number;
    reference: string;
    total: number;
};

export default function PosScreen() {
    const navigation = useNavigation<Nav>();
    const { width } = useWindowDimensions();
    const numColumns = width >= 700 ? 2 : 1;

    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const orgName =
        useOrganizationStore((s) => s.organization?.name ?? 'Ma Boutique');
    const userId = useSessionStore((s) => s.user?.id ?? 1);
    const { formatCurrency } = useOrganizationCurrency();

    // Caisse ouverte ?
    const {
        openRegister,
        loading: loadingRegister,
        refresh: refreshRegister,
    } = useCashDashboard();

    // Catalogue
    const [search, setSearch] = React.useState('');
    const [categoryId, setCategoryId] = React.useState<number | null>(null);
    const { data: categories } = useCategories();
    const { data: articles, loading: loadingArticles } = useArticles({
        search,
        category_id: categoryId,
        per_page: 200,
        page: 1,
    });

    // Panier
    const [cart, setCart] = React.useState<CartLine[]>([]);
    const [cartOpen, setCartOpen] = React.useState(false);

    // Champs de paiement
    const [customerName, setCustomerName] = React.useState('');
    const [customerPhone, setCustomerPhone] = React.useState('');
    const [paymentMethod, setPaymentMethod] =
        React.useState<PaymentMethod>('CASH');
    const [discount, setDiscount] = React.useState('');
    const [amountPaid, setAmountPaid] = React.useState('');
    const [amountPaidEdited, setAmountPaidEdited] = React.useState(false);

    const [processing, setProcessing] = React.useState(false);
    const [errors, setErrors] = React.useState<string[]>([]);

    // Écran de succès post-vente
    const [saleSuccess, setSaleSuccess] = React.useState<SaleSuccess | null>(null);
    const [printing, setPrinting] = React.useState(false);
    const [printError, setPrintError] = React.useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            refreshRegister();
        }, [refreshRegister]),
    );

    // Totaux
    const subtotal = React.useMemo(
        () => cart.reduce((sum, l) => sum + l.quantity * l.unit_price, 0),
        [cart],
    );

    const total = React.useMemo(
        () => Math.max(0, subtotal - Number(discount || 0)),
        [subtotal, discount],
    );

    React.useEffect(() => {
        if (!amountPaidEdited) {
            setAmountPaid(total > 0 ? String(total) : '');
        }
    }, [amountPaidEdited, total]);

    const change = React.useMemo(
        () => Math.max(0, Number(amountPaid || 0) - total),
        [amountPaid, total],
    );

    const cartCount = React.useMemo(
        () => cart.reduce((sum, l) => sum + l.quantity, 0),
        [cart],
    );

    // -------------------------------------------------------------
    // Actions panier
    // -------------------------------------------------------------
    const addToCart = (article: ArticleRow, qtyType?: QuantityType) => {
        const quantityType: QuantityType =
            qtyType ?? (article.unit_type === 'PACK' ? 'PACK' : 'UNIT');
        const price = resolveUnitPrice(article, quantityType);

        setCart((current) => {
            const idx = current.findIndex(
                (l) =>
                    l.article_id === article.id &&
                    l.quantity_type === quantityType,
            );
            if (idx >= 0) {
                const updated = [...current];
                updated[idx] = {
                    ...updated[idx],
                    quantity: updated[idx].quantity + 1,
                };
                return updated;
            }
            return [
                ...current,
                {
                    article_id: article.id,
                    article,
                    quantity: 1,
                    quantity_type: quantityType,
                    unit_price: price,
                },
            ];
        });
    };

    const updateQty = (index: number, delta: number) => {
        setCart((current) => {
            const updated = [...current];
            const next = updated[index].quantity + delta;
            if (next <= 0) {
                return updated.filter((_, i) => i !== index);
            }
            updated[index] = { ...updated[index], quantity: next };
            return updated;
        });
    };

    const removeLine = (index: number) => {
        setCart((current) => current.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscount('');
        setAmountPaid('');
        setAmountPaidEdited(false);
        setPaymentMethod('CASH');
        setErrors([]);
    };

    // -------------------------------------------------------------
    // Validation de la vente
    // -------------------------------------------------------------
    const submitSale = async () => {
        setErrors([]);
        if (!openRegister) {
            setErrors(['Aucune caisse ouverte.']);
            return;
        }
        if (cart.length === 0) {
            setErrors(['Le panier est vide.']);
            return;
        }
        if (Number(amountPaid || 0) < total) {
            setErrors(['Le montant payé est insuffisant.']);
            return;
        }

        setProcessing(true);
        try {
            const res = await SalesRepo.create({
                organization_id: orgId,
                user_id: userId,
                cash_register_id: openRegister.id,
                items: cart.map((l) => ({
                    article_id: l.article_id,
                    quantity: l.quantity,
                    quantity_type: l.quantity_type,
                    unit_price: l.unit_price,
                })),
                payment_method: paymentMethod,
                amount_paid: Number(amountPaid || 0),
                discount: Number(discount || 0),
                customer_name: customerName.trim() || null,
                customer_phone: customerPhone.trim() || null,
                notes: null,
            });

            // Affiche l'écran de succès
            setSaleSuccess({
                sale_id: res.sale_id,
                reference: res.reference,
                total,
            });
            setCartOpen(false);
        } catch (e) {
            setErrors([
                e instanceof Error ? e.message : 'Erreur lors de la vente.',
            ]);
        } finally {
            setProcessing(false);
        }
    };

    // -------------------------------------------------------------
    // Impression du reçu
    // -------------------------------------------------------------
    const printReceipt = async (mode: 'bluetooth' | 'system') => {
        if (!saleSuccess || printing) return;
        setPrintError(null);
        setPrinting(true);
        try {
            const { sale, items } = await SalesRepo.find(saleSuccess.sale_id);
            if (!sale) {
                throw new Error('Vente introuvable pour impression.');
            }

            if (mode === 'system') {
                await SystemPrinterService.printReceipt(
                    sale,
                    items,
                    orgName,
                    formatCurrency,
                );
            } else {
                const result = await PrinterService.printReceipt(
                    sale,
                    items,
                    orgName,
                    formatCurrency,
                );
                if (!result.success) {
                    setPrintError(result.error ?? 'Impression impossible.');
                }
            }
        } catch (e) {
            setPrintError(
                e instanceof Error ? e.message : 'Erreur d’impression.',
            );
        } finally {
            setPrinting(false);
        }
    };

    const handlePrint = () => {
        if (!saleSuccess || printing) return;
        Alert.alert('Mode d’impression', 'Choisis le mode à utiliser.', [
            {
                text: 'Bluetooth POS',
                onPress: () => void printReceipt('bluetooth'),
            },
            {
                text: 'Impression système',
                onPress: () => void printReceipt('system'),
            },
            { text: 'Annuler', style: 'cancel' },
        ]);
    };

    const closeSuccess = () => {
        setSaleSuccess(null);
        setPrintError(null);
        clearCart();
    };

    // -------------------------------------------------------------
    // Rendu
    // -------------------------------------------------------------
    if (loadingRegister) {
        return (
            <View style={styles.center}>
                <Skeleton height={200} borderRadius={12} />
            </View>
        );
    }

    if (!openRegister) {
        return (
            <SafeAreaView style={styles.safe} edges={['bottom']}>
                <View style={styles.blockedWrap}>
                    <View style={styles.blockedIcon}>
                        <ShoppingCart size={32} color={P.amber} />
                    </View>
                    <Text style={styles.blockedTitle}>
                        Ouvre une caisse avant de vendre
                    </Text>
                    <Text style={styles.blockedText}>
                        Le point de vente reste bloqué tant qu’aucune caisse
                        n’est ouverte.
                    </Text>
                    <Button
                        onPress={() =>
                            navigation.navigate('Main', {
                                screen: 'Cash.Dashboard',
                            } as any)
                        }
                        style={{ marginTop: 16 }}
                    >
                        Aller à la caisse
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            {/* Header caisse */}
            <View style={styles.topBar}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.topLabel}>Caisse active</Text>
                    <Text style={styles.topValue}>
                        {formatCurrency(openRegister.opening_balance)}
                    </Text>
                </View>
                <Badge variant="default">Jour {openRegister.date}</Badge>
            </View>

            {/* Filtres */}
            <View style={styles.filters}>
                <Input
                    placeholder="Nom, SKU, code-barres…"
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                />
                <Select
                    value={categoryId}
                    onValueChange={(v) => setCategoryId(v)}
                    placeholder="Toutes catégories"
                    title="Catégorie"
                    options={[
                        { label: 'Toutes catégories', value: null as any },
                        ...categories.map((c) => ({
                            label: c.name,
                            value: c.id,
                        })),
                    ]}
                />
            </View>

            {/* Grille produits */}
            <FlatList
                data={articles}
                keyExtractor={(item) => String(item.id)}
                numColumns={numColumns}
                key={numColumns}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={
                    numColumns > 1 ? { gap: 10 } : undefined
                }
                renderItem={({ item }) => (
                    <ProductCard
                        article={item}
                        formatCurrency={formatCurrency}
                        onAdd={(qt) => addToCart(item, qt)}
                    />
                )}
                ListEmptyComponent={
                    loadingArticles ? (
                        <View style={{ gap: 10, padding: 16 }}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={120} borderRadius={12} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Package size={32} color={P.muted} />
                            <Text style={styles.muted}>
                                Aucun article trouvé.
                            </Text>
                        </View>
                    )
                }
            />

            {/* Barre panier flottante */}
            {cartCount > 0 ? (
                <Pressable
                    onPress={() => setCartOpen(true)}
                    style={({ pressed }) => [
                        styles.cartBar,
                        pressed && { opacity: 0.95 },
                    ]}
                >
                    <View style={styles.cartBarLeft}>
                        <View style={styles.cartBarIcon}>
                            <ShoppingCart size={18} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text style={styles.cartBarCount}>
                                {cartCount} article{cartCount > 1 ? 's' : ''}
                            </Text>
                            <Text style={styles.cartBarLabel}>Voir le panier</Text>
                        </View>
                    </View>
                    <Text style={styles.cartBarTotal}>
                        {formatCurrency(total)}
                    </Text>
                </Pressable>
            ) : null}

            {/* BottomSheet panier */}
            {cartOpen ? (
                <BottomSheet
                    visible
                    onClose={() => setCartOpen(false)}
                    maxHeightRatio={0.92}
                >
                    <BottomSheetHeader>
                        <BottomSheetTitle>
                            Panier · {cartCount} article{cartCount > 1 ? 's' : ''}
                        </BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetBody scrollable>
                        {errors.length > 0 ? <AlertError errors={errors} /> : null}

                        <View style={{ gap: 8 }}>
                            {cart.map((line, index) => (
                                <View
                                    key={`${line.article_id}-${line.quantity_type}`}
                                    style={styles.line}
                                >
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text
                                            style={styles.lineTitle}
                                            numberOfLines={1}
                                        >
                                            {line.article.name}
                                        </Text>
                                        <Text style={styles.lineMeta}>
                                            {line.quantity_type} ·{' '}
                                            {formatCurrency(line.unit_price)}
                                        </Text>
                                    </View>

                                    <View style={styles.qtyGroup}>
                                        <Pressable
                                            onPress={() => updateQty(index, -1)}
                                            style={styles.qtyBtn}
                                        >
                                            <Minus size={14} color={P.fg} />
                                        </Pressable>
                                        <Text style={styles.qtyText}>
                                            {line.quantity}
                                        </Text>
                                        <Pressable
                                            onPress={() => updateQty(index, 1)}
                                            style={styles.qtyBtn}
                                        >
                                            <Plus size={14} color={P.fg} />
                                        </Pressable>
                                    </View>

                                    <Pressable
                                        onPress={() => removeLine(index)}
                                        style={styles.removeBtn}
                                    >
                                        <Trash2 size={14} color={P.rose} />
                                    </Pressable>
                                </View>
                            ))}
                        </View>

                        <FormField label="Client (optionnel)">
                            <Input
                                value={customerName}
                                onChangeText={setCustomerName}
                                placeholder="Nom du client"
                            />
                        </FormField>
                        <FormField label="Téléphone (optionnel)">
                            <Input
                                value={customerPhone}
                                onChangeText={setCustomerPhone}
                                placeholder="+243…"
                                keyboardType="phone-pad"
                            />
                        </FormField>

                        <FormField label="Moyen de paiement">
                            <Select
                                value={paymentMethod}
                                onValueChange={(v) =>
                                    setPaymentMethod(v as PaymentMethod)
                                }
                                options={[
                                    { label: 'Espèces', value: 'CASH' },
                                    { label: 'Carte', value: 'CARD' },
                                    { label: 'Mobile Money', value: 'MOBILE' },
                                    { label: 'Crédit', value: 'CREDIT' },
                                    { label: 'Autre', value: 'OTHER' },
                                ]}
                            />
                        </FormField>

                        <FormField label="Remise">
                            <Input
                                value={discount}
                                onChangeText={setDiscount}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </FormField>

                        <FormField label="Montant payé (modifiable)">
                            <Input
                                value={amountPaid}
                                onChangeText={(value) => {
                                    setAmountPaidEdited(true);
                                    setAmountPaid(value);
                                }}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </FormField>

                        <View style={styles.totalsBox}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Sous-total</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(subtotal)}
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Remise</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(Number(discount || 0))}
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Rendu</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(change)}
                                </Text>
                            </View>
                            <View style={[styles.totalRow, styles.totalRowBig]}>
                                <Text style={styles.totalLabelBig}>TOTAL</Text>
                                <Text style={styles.totalValueBig}>
                                    {formatCurrency(total)}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}
                        >
                            <Button
                                variant="outline"
                                onPress={clearCart}
                                style={{ flex: 1 }}
                            >
                                Vider
                            </Button>
                            <Button
                                onPress={submitSale}
                                loading={processing}
                                leftIcon={
                                    paymentMethod === 'CASH' ? (
                                        <Wallet size={16} color="#FAFAFA" />
                                    ) : (
                                        <CreditCard size={16} color="#FAFAFA" />
                                    )
                                }
                                style={{ flex: 2 }}
                            >
                                Valider la vente
                            </Button>
                        </View>
                    </BottomSheetBody>
                </BottomSheet>
            ) : null}

            {/* MODAL DE SUCCÈS + IMPRESSION */}
            <Modal
                visible={!!saleSuccess}
                transparent
                animationType="fade"
                onRequestClose={closeSuccess}
                statusBarTranslucent
            >
                <View style={styles.successOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIconWrap}>
                            <CheckCircle2 size={48} color={P.emerald} />
                        </View>

                        <Text style={styles.successTitle}>Vente enregistrée</Text>
                        <Text style={styles.successRef}>
                            {saleSuccess?.reference}
                        </Text>
                        <Text style={styles.successTotal}>
                            {saleSuccess
                                ? formatCurrency(saleSuccess.total)
                                : ''}
                        </Text>

                        {printError ? (
                            <View style={{ marginTop: 12, width: '100%' }}>
                                <AlertError
                                    errors={[printError]}
                                    title="Impression"
                                />
                            </View>
                        ) : null}

                        <View style={styles.successActions}>
                            <Button
                                variant="outline"
                                onPress={closeSuccess}
                                style={{ flex: 1 }}
                            >
                                Fermer
                            </Button>
                            <Button
                                onPress={handlePrint}
                                loading={printing}
                                leftIcon={<Printer size={16} color="#FAFAFA" />}
                                style={{ flex: 2 }}
                            >
                                Choisir le mode d’impression
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// -------------------------------------------------------------
// Carte produit
// -------------------------------------------------------------
function ProductCard({
    article,
    formatCurrency,
    onAdd,
}: {
    article: ArticleRow;
    formatCurrency: (n: number) => string;
    onAdd: (qt: QuantityType) => void;
}) {
    const stock = article.current_stock;
    const low = stock <= article.alert_threshold;
    const out = stock <= 0;

    const showUnitBtn =
        article.unit_type === 'PACK' && article.allow_unit_sale === 1;

    return (
        <View style={[styles.product, { flex: 1 }]}>
            <View style={styles.productTop}>
                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.productTitle} numberOfLines={1}>
                        {article.name}
                    </Text>
                    <Text style={styles.productSub} numberOfLines={1}>
                        {article.category_name ?? 'Sans catégorie'}
                    </Text>
                </View>
                <Badge
                    variant={out ? 'destructive' : low ? 'secondary' : 'outline'}
                >
                    {out ? 'Rupture' : `Stock ${stock}`}
                </Badge>
            </View>

            <View style={styles.productPrice}>
                <Text style={styles.productPriceLabel}>Prix</Text>
                <Text style={styles.productPriceValue}>
                    {formatCurrency(article.price)}
                </Text>
                {showUnitBtn ? (
                    <Text style={styles.productUnitPrice}>
                        Unité :{' '}
                        {formatCurrency(resolveUnitPrice(article, 'UNIT'))}
                    </Text>
                ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
                <Button
                    size="sm"
                    disabled={out}
                    onPress={() =>
                        onAdd(article.unit_type === 'PACK' ? 'PACK' : 'UNIT')
                    }
                    style={{ flex: 1 }}
                >
                    {article.unit_type === 'PACK' ? 'Ajouter pack' : 'Ajouter'}
                </Button>
                {showUnitBtn ? (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={out}
                        onPress={() => onAdd('UNIT')}
                        style={{ flex: 1 }}
                    >
                        Unité
                    </Button>
                ) : null}
            </View>
        </View>
    );
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: P.card,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: P.border,
    },
    topLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    topValue: { fontSize: 18, fontWeight: '800', color: P.fg, marginTop: 2 },

    filters: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        backgroundColor: P.card,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: P.border,
    },

    listContent: { padding: 16, gap: 10, paddingBottom: 100 },

    product: {
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
        gap: 10,
    },
    productTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    productTitle: { fontSize: 15, fontWeight: '700', color: P.fg },
    productSub: { fontSize: 12, color: P.muted, marginTop: 2 },
    productPrice: {
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 8,
    },
    productPriceLabel: {
        fontSize: 11,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    productPriceValue: {
        fontSize: 18,
        fontWeight: '800',
        color: P.fg,
        marginTop: 2,
    },
    productUnitPrice: { fontSize: 12, color: P.muted, marginTop: 2 },

    // Blocage
    blockedWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 8,
    },
    blockedIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    blockedTitle: { fontSize: 22, fontWeight: '800', color: P.fg },
    blockedText: { fontSize: 14, color: P.muted, textAlign: 'center' },

    // Barre panier
    cartBar: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: P.dark,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cartBarIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBarCount: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    cartBarLabel: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
    cartBarTotal: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

    // Lignes panier
    line: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: P.border,
    },
    lineTitle: { fontSize: 14, fontWeight: '600', color: P.fg },
    lineMeta: { fontSize: 12, color: P.muted, marginTop: 2 },
    qtyGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: P.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        minWidth: 24,
        textAlign: 'center',
        fontWeight: '700',
        color: P.fg,
    },
    removeBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Totaux
    totalsBox: {
        marginTop: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: P.dark,
        gap: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: { color: '#CBD5E1', fontSize: 13 },
    totalValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    totalRowBig: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.15)',
        paddingTop: 10,
        marginTop: 4,
    },
    totalLabelBig: {
        color: '#CBD5E1',
        fontSize: 12,
        letterSpacing: 1.5,
        fontWeight: '700',
    },
    totalValueBig: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },

    empty: { padding: 40, alignItems: 'center', gap: 12 },
    muted: { color: P.muted, fontSize: 14 },

    // Modal succès
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    successCard: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 6,
    },
    successIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: P.fg,
    },
    successRef: {
        fontSize: 14,
        color: P.muted,
        marginTop: 2,
    },
    successTotal: {
        fontSize: 28,
        fontWeight: '800',
        color: P.fg,
        marginTop: 8,
    },
    successActions: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
        marginTop: 20,
    },
});