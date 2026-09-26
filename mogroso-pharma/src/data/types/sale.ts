// src/data/types/sale.ts
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE' | 'CREDIT' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type QuantityType = 'PACK' | 'UNIT';

export type Sale = {
    id: number;
    organization_id: number | null;
    user_id: number;
    cash_register_id: number | null;
    reference: string;
    subtotal: number;
    discount: number;
    tax: number;
    total_amount: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    amount_paid: number;
    change_amount: number;
    customer_name: string | null;
    customer_phone: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type SaleRow = Sale & {
    user_name: string | null;
};

export type SaleItem = {
    id: number;
    organization_id: number | null;
    sale_id: number;
    article_id: number;
    quantity: number;
    quantity_type: QuantityType;
    unit_price: number;
    discount: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
};

export type SaleItemRow = SaleItem & {
    article_name: string | null;
    article_sku: string | null;
    article_units_per_pack: number | null;
};

export type SaleFilters = {
    search?: string;
    status?: PaymentStatus | '';
    payment_method?: PaymentMethod | '';
};

export type NewSaleItem = {
    article_id: number;
    quantity: number;
    quantity_type: QuantityType;
    unit_price: number;
};

export type NewSaleInput = {
    organization_id: number | null;
    user_id: number;
    cash_register_id: number | null;
    items: NewSaleItem[];
    payment_method: PaymentMethod;
    amount_paid: number;
    discount: number;
    customer_name: string | null;
    customer_phone: string | null;
    notes: string | null;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Espèces',
    CARD: 'Carte',
    MOBILE: 'Mobile Money',
    CREDIT: 'Crédit',
    OTHER: 'Autre',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    PENDING: 'En attente',
    PARTIAL: 'Partiel',
    PAID: 'Payée',
    CANCELLED: 'Annulée',
};

/** Calcule le prix unitaire selon le type de vente. */
export function resolveUnitPrice(
    article: {
        price: number;
        unit_type: QuantityType;
        unit_price: number | null;
        units_per_pack: number | null;
    },
    quantityType: QuantityType,
): number {
    if (quantityType === 'PACK') return Number(article.price || 0);
    if (article.unit_type === 'PACK') {
        if (article.unit_price) return Number(article.unit_price);
        const upp = Number(article.units_per_pack || 1);
        return upp > 0 ? Number(article.price || 0) / upp : Number(article.price || 0);
    }
    return Number(article.price || 0);
}