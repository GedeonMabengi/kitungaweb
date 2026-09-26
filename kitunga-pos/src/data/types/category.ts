// src/data/types/category.ts
export type Category = {
    id: number;
    organization_id: number | null;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    is_active: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};