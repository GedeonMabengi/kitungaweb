// src/data/types/stock.ts
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'RETURN';
export type StockQuantityType = 'PACK' | 'UNIT';

export type StockMovement = {
    id: number;
    organization_id: number | null;
    article_id: number;
    user_id: number;
    movement_type: StockMovementType;
    quantity: number;
    quantity_type: StockQuantityType;
    stock_before: number;
    stock_after: number;
    reason: string | null;
    reference: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

/** Mouvement enrichi (JOIN article + user) */
export type StockMovementRow = StockMovement & {
    article_name: string | null;
    article_sku: string | null;
    article_units_per_pack: number | null;
    user_name: string | null;
};

export type StockMovementFilters = {
    search?: string;
    article_id?: number | null;
    movement_type?: StockMovementType | '';
    page?: number;
    per_page?: number;
};

export const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
    IN: 'Entrée',
    OUT: 'Sortie',
    ADJUSTMENT: 'Ajustement',
    SALE: 'Vente',
    RETURN: 'Retour',
};