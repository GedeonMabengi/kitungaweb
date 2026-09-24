// src/data/repositories/categories.repo.ts
import { getDb } from '../db/client';
import type { Category } from '../types/category';

export type CategoryWithCount = Category & {
    articles_count: number;
};

export type CategoryFilters = {
    search?: string;
    status?: '' | '1' | '0';
};

export const CategoriesRepo = {
    /** Liste simple (pour Select, filtres…) */
    async list(): Promise<Category[]> {
        const db = await getDb();
        return db.getAllAsync<Category>(
            `SELECT * FROM categories
             WHERE deleted_at IS NULL
             ORDER BY name ASC`,
        );
    },

    /** Liste filtrée avec compteur d’articles (pour l’écran Index) */
    async listWithCount(
        filters: CategoryFilters = {},
    ): Promise<CategoryWithCount[]> {
        const db = await getDb();

        const where: string[] = ['c.deleted_at IS NULL'];
        const params: (string | number)[] = [];

        if (filters.search) {
            where.push('c.name LIKE ?');
            params.push(`%${filters.search}%`);
        }

        if (filters.status === '1') where.push('c.is_active = 1');
        if (filters.status === '0') where.push('c.is_active = 0');

        return db.getAllAsync<CategoryWithCount>(
            `SELECT c.*,
                    (SELECT COUNT(*) FROM articles a
                     WHERE a.category_id = c.id AND a.deleted_at IS NULL) AS articles_count
             FROM categories c
             WHERE ${where.join(' AND ')}
             ORDER BY c.name ASC`,
            params,
        );
    },

    async find(id: number): Promise<Category | null> {
        const db = await getDb();
        return db.getFirstAsync<Category>(
            `SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL`,
            [id],
        );
    },

    async findWithCount(id: number): Promise<CategoryWithCount | null> {
        const db = await getDb();
        return db.getFirstAsync<CategoryWithCount>(
            `SELECT c.*,
                    (SELECT COUNT(*) FROM articles a
                     WHERE a.category_id = c.id AND a.deleted_at IS NULL) AS articles_count
             FROM categories c
             WHERE c.id = ? AND c.deleted_at IS NULL`,
            [id],
        );
    },

    async create(input: {
        organization_id: number | null;
        name: string;
        description: string | null;
        is_active: boolean;
    }): Promise<number> {
        const db = await getDb();
        const slug = await ensureUniqueSlug(db, input.name, input.organization_id);

        const r = await db.runAsync(
            `INSERT INTO categories
                (organization_id, name, slug, description, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [
                input.organization_id,
                input.name,
                slug,
                input.description,
                input.is_active ? 1 : 0,
            ],
        );
        return r.lastInsertRowId;
    },

    async update(
        id: number,
        input: {
            name: string;
            description: string | null;
            is_active: boolean;
        },
    ): Promise<void> {
        const db = await getDb();
        await db.runAsync(
            `UPDATE categories
             SET name = ?, description = ?, is_active = ?, updated_at = datetime('now')
             WHERE id = ?`,
            [input.name, input.description, input.is_active ? 1 : 0, id],
        );
    },

    async softDelete(id: number): Promise<void> {
        const db = await getDb();
        await db.runAsync(
            `UPDATE categories
             SET deleted_at = datetime('now'), updated_at = datetime('now')
             WHERE id = ?`,
            [id],
        );
    },

    async articlesCount(id: number): Promise<number> {
        const db = await getDb();
        const row = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) AS count FROM articles
             WHERE category_id = ? AND deleted_at IS NULL`,
            [id],
        );
        return row?.count ?? 0;
    },
};

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function slugify(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(
    db: any,
    name: string,
    organizationId: number | null,
): Promise<string> {
    const base = slugify(name) || 'categorie';
    let slug = base;
    let i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const row = await db.getFirstAsync<{ id: number }>(
            `SELECT id FROM categories WHERE slug = ? AND organization_id = ? AND deleted_at IS NULL`,
            [slug, organizationId],
        );
        if (!row) return slug;
        i++;
        slug = `${base}-${i}`;
    }
}