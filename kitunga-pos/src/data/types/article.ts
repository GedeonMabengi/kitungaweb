// src/data/types/article.ts
export type Article = {
    id: number;
    organization_id: number | null;
    category_id: number | null;
    name: string;
    slug: string;
    sku: string | null;
    barcode: string | null;
    description: string | null;
    price: number;
    cost_price: number | null;
    unit_type: 'PACK' | 'UNIT';
    units_per_pack: number | null;
    unit_price: number | null;
    initial_quantity: number;
    current_stock: number;
    alert_threshold: number;
    expiration_date: string | null;
    image: string | null;
    is_active: number;
    allow_unit_sale: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

/** Article enrichi avec le nom de sa catégorie (JOIN) */
export type ArticleRow = Article & {
    category_name: string | null;
};

export type ArticleFilters = {
    search?: string;
    category_id?: number | null;
    stock_status?: 'ok' | 'low' | 'out' | '';
    page?: number;
    per_page?: number;
};

export type StockStatus = 'ok' | 'low' | 'out';