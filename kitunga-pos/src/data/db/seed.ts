// données de démo (catégories, articles…)
// src/data/db/seed.ts
import { getDb } from './client';
import { useOrganizationStore } from '../../store/organization.store';

/**
 * Insère des données de démo si la DB est vide.
 * Idempotent : peut être appelé à chaque démarrage.
 */
export async function seedDatabase(): Promise<void> {
    const db = await getDb();

    const row = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM organizations',
    );
    const alreadySeeded = (row?.count ?? 0) > 0;

    if (alreadySeeded) {
        await syncOrganizationToStore();
        return;
    }

    console.log('[seed] insertion des données de démo...');

    // 1) Organisation
    const orgResult = await db.runAsync(
        `INSERT INTO organizations
            (name, slug, currency, base_currency, exchange_rate, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Kitunga Demo', 'kitunga-demo', 'CDF', 'CDF', 1, 'active'],
    );
    const orgId = orgResult.lastInsertRowId;

    // 2) Admin
    const userResult = await db.runAsync(
        `INSERT INTO users
            (organization_id, name, email, roles, permissions, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
            orgId,
            'Demo Admin',
            'admin@kitunga.local',
            JSON.stringify(['admin']),
            JSON.stringify([
                'articles.view', 'articles.create', 'articles.update', 'articles.delete',
                'categories.view', 'categories.create', 'categories.update', 'categories.delete',
                'sales.view', 'sales.create', 'sales.reports',
                'cash.view', 'cash.open', 'cash.close', 'cash.manage', 'cash.reports',
                'stock.view', 'stock.manage', 'stock.reports',
                'reports.view',
            ]),
        ],
    );
    const userId = userResult.lastInsertRowId;

    await db.runAsync(
        'UPDATE organizations SET owner_user_id = ? WHERE id = ?',
        [userId, orgId],
    );

    // 3) Catégories
    const categories = [
        { name: 'Boissons', slug: 'boissons' },
        { name: 'Alimentation', slug: 'alimentation' },
        { name: 'Hygiène', slug: 'hygiene' },
        { name: 'Divers', slug: 'divers' },
    ];
    const catIds: number[] = [];
    for (const c of categories) {
        const r = await db.runAsync(
            `INSERT INTO categories (organization_id, name, slug)
             VALUES (?, ?, ?)`,
            [orgId, c.name, c.slug],
        );
        catIds.push(r.lastInsertRowId);
    }

    // 4) Articles
    const articles = [
        { name: 'Coca-Cola 1.5L',  slug: 'coca-15l',   sku: 'BOI-001', barcode: '1110001', price: 2500, cost: 1800, stock: 40, cat: 0 },
        { name: 'Fanta 1.5L',      slug: 'fanta-15l',  sku: 'BOI-002', barcode: '1110002', price: 2500, cost: 1800, stock: 35, cat: 0 },
        { name: 'Eau minérale 1L', slug: 'eau-1l',     sku: 'BOI-003', barcode: '1110003', price: 800,  cost: 500,  stock: 120, cat: 0 },
        { name: 'Riz 5kg',         slug: 'riz-5kg',    sku: 'ALI-001', barcode: '2220001', price: 15000, cost: 12000, stock: 25, cat: 1 },
        { name: 'Huile 1L',        slug: 'huile-1l',   sku: 'ALI-002', barcode: '2220002', price: 3500, cost: 2800, stock: 60, cat: 1 },
        { name: 'Sucre 1kg',       slug: 'sucre-1kg',  sku: 'ALI-003', barcode: '2220003', price: 2200, cost: 1700, stock: 45, cat: 1 },
        { name: 'Savon Kabakrou',  slug: 'savon-kb',   sku: 'HYG-001', barcode: '3330001', price: 1200, cost: 800,  stock: 80, cat: 2 },
        { name: 'Dentifrice',      slug: 'dentifrice', sku: 'HYG-002', barcode: '3330002', price: 1800, cost: 1200, stock: 30, cat: 2 },
    ];
    for (const a of articles) {
        await db.runAsync(
            `INSERT INTO articles
                (organization_id, category_id, name, slug, sku, barcode,
                 price, cost_price, unit_type, initial_quantity, current_stock,
                 alert_threshold, is_active, allow_unit_sale)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNIT', ?, ?, 10, 1, 1)`,
            [
                orgId, catIds[a.cat], a.name, a.slug, a.sku, a.barcode,
                a.price, a.cost, a.stock, a.stock,
            ],
        );
    }

    // 5) Séquence de référence ventes
    await db.runAsync(
        `INSERT OR IGNORE INTO sequences (key, last_value) VALUES ('sale', 0)`,
    );

    await syncOrganizationToStore();
    console.log('[seed] terminé');
}

/** Charge l'organisation courante depuis SQLite dans le store Zustand. */
async function syncOrganizationToStore(): Promise<void> {
    const db = await getDb();
    const org = await db.getFirstAsync<{
        id: number;
        name: string;
        currency: string;
        base_currency: string;
        exchange_rate: number;
    }>('SELECT id, name, currency, base_currency, exchange_rate FROM organizations LIMIT 1');

    if (org) {
        useOrganizationStore.getState().setOrganization({
            id: org.id,
            name: org.name,
            currency: org.currency,
            base_currency: org.base_currency,
            exchange_rate: org.exchange_rate,
        });
    }
}