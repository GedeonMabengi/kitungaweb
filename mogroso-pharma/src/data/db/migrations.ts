// src/data/db/migrations.ts

/**
 * Chaque entrée = une version.
 * L'index + 1 = numéro de version.
 * On n'édite JAMAIS une migration déjà livrée : on en ajoute une nouvelle.
 */
export const MIGRATIONS: string[] = [
    // ---------------------------------------------------------------
    // v1 — Schéma initial (aligné sur Laravel, adapté SQLite offline)
    // ---------------------------------------------------------------
    `
    -- =========================
    -- ORGANIZATIONS
    -- =========================
    CREATE TABLE organizations (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        name            TEXT    NOT NULL,
        slug            TEXT    NOT NULL UNIQUE,
        owner_user_id   INTEGER,
        billing_email   TEXT,
        phone           TEXT,
        country_code    TEXT,
        currency        TEXT    NOT NULL DEFAULT 'CDF',
        base_currency   TEXT    NOT NULL DEFAULT 'CDF',
        exchange_rate   REAL    NOT NULL DEFAULT 1,
        status          TEXT    NOT NULL DEFAULT 'active',
        trial_ends_at   TEXT,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        deleted_at      TEXT
    );

    -- =========================
    -- USERS
    -- =========================
    CREATE TABLE users (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
        name                TEXT    NOT NULL,
        email               TEXT    NOT NULL UNIQUE,
        email_verified_at   TEXT,
        password            TEXT,
        phone               TEXT,
        avatar              TEXT,
        is_active           INTEGER NOT NULL DEFAULT 1,
        last_login_at       TEXT,
        two_factor_enabled  INTEGER NOT NULL DEFAULT 0,
        roles               TEXT,   -- JSON array : ["admin","vendeur"]
        permissions         TEXT,   -- JSON array : ["articles.view", ...]
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_users_org ON users(organization_id);

    -- =========================
    -- CATEGORIES
    -- =========================
    CREATE TABLE categories (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        name            TEXT    NOT NULL,
        slug            TEXT    NOT NULL,
        description     TEXT,
        image           TEXT,
        is_active       INTEGER NOT NULL DEFAULT 1,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        deleted_at      TEXT,
        UNIQUE (organization_id, slug)
    );
    CREATE INDEX idx_categories_org_active ON categories(organization_id, is_active);

    -- =========================
    -- ARTICLES
    -- =========================
    CREATE TABLE articles (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name                TEXT    NOT NULL,
        slug                TEXT    NOT NULL,
        sku                 TEXT,
        barcode             TEXT,
        description         TEXT,
        price               REAL    NOT NULL DEFAULT 0,
        cost_price          REAL,
        unit_type           TEXT    NOT NULL DEFAULT 'UNIT'
                                    CHECK (unit_type IN ('PACK','UNIT')),
        units_per_pack      INTEGER,
        unit_price          REAL,
        initial_quantity    INTEGER NOT NULL DEFAULT 0,
        current_stock       INTEGER NOT NULL DEFAULT 0,
        alert_threshold     INTEGER NOT NULL DEFAULT 10,
        expiration_date     TEXT,
        image               TEXT,
        is_active           INTEGER NOT NULL DEFAULT 1,
        allow_unit_sale     INTEGER NOT NULL DEFAULT 1,
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        deleted_at          TEXT,
        UNIQUE (organization_id, slug)
    );
    CREATE INDEX idx_articles_org           ON articles(organization_id);
    CREATE INDEX idx_articles_category      ON articles(category_id);
    CREATE INDEX idx_articles_name          ON articles(name);
    CREATE INDEX idx_articles_sku           ON articles(sku);
    CREATE INDEX idx_articles_barcode       ON articles(barcode);
    CREATE INDEX idx_articles_stock         ON articles(current_stock);
    CREATE INDEX idx_articles_expiration    ON articles(expiration_date);

    -- =========================
    -- STOCK MOVEMENTS
    -- =========================
    CREATE TABLE stock_movements (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        article_id      INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        user_id         INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
        movement_type   TEXT    NOT NULL
                                CHECK (movement_type IN ('IN','OUT','ADJUSTMENT','SALE','RETURN')),
        quantity        INTEGER NOT NULL,
        quantity_type   TEXT    NOT NULL DEFAULT 'UNIT'
                                CHECK (quantity_type IN ('PACK','UNIT')),
        stock_before    INTEGER NOT NULL,
        stock_after     INTEGER NOT NULL,
        reason          TEXT,
        reference       TEXT,
        notes           TEXT,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_stock_mvt_article   ON stock_movements(article_id, created_at);
    CREATE INDEX idx_stock_mvt_type      ON stock_movements(movement_type);
    CREATE INDEX idx_stock_mvt_reference ON stock_movements(reference);

    -- =========================
    -- CASH REGISTERS
    -- =========================
    CREATE TABLE cash_registers (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date                TEXT    NOT NULL, -- YYYY-MM-DD
        opening_balance     REAL    NOT NULL DEFAULT 0,
        total_input         REAL    NOT NULL DEFAULT 0,
        total_output        REAL    NOT NULL DEFAULT 0,
        expected_balance    REAL    NOT NULL DEFAULT 0,
        actual_balance      REAL,
        difference          REAL,
        status              TEXT    NOT NULL DEFAULT 'OPEN'
                                    CHECK (status IN ('OPEN','CLOSED')),
        opened_at           TEXT    NOT NULL DEFAULT (datetime('now')),
        closed_at           TEXT,
        opening_notes       TEXT,
        closing_notes       TEXT,
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE (user_id, date)
    );
    CREATE INDEX idx_cash_reg_status ON cash_registers(status, date);

    -- =========================
    -- SALES
    -- =========================
    CREATE TABLE sales (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cash_register_id    INTEGER REFERENCES cash_registers(id) ON DELETE SET NULL,
        reference           TEXT    NOT NULL UNIQUE,
        subtotal            REAL    NOT NULL DEFAULT 0,
        discount            REAL    NOT NULL DEFAULT 0,
        tax                 REAL    NOT NULL DEFAULT 0,
        total_amount        REAL    NOT NULL DEFAULT 0,
        payment_method      TEXT    NOT NULL DEFAULT 'CASH'
                                    CHECK (payment_method IN ('CASH','CARD','MOBILE','CREDIT','OTHER')),
        payment_status      TEXT    NOT NULL DEFAULT 'PAID'
                                    CHECK (payment_status IN ('PENDING','PARTIAL','PAID','CANCELLED')),
        amount_paid         REAL    NOT NULL DEFAULT 0,
        change_amount       REAL    NOT NULL DEFAULT 0,
        customer_name       TEXT,
        customer_phone      TEXT,
        notes               TEXT,
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        deleted_at          TEXT
    );
    CREATE INDEX idx_sales_user_date    ON sales(user_id, created_at);
    CREATE INDEX idx_sales_reference    ON sales(reference);
    CREATE INDEX idx_sales_status       ON sales(payment_status);
    CREATE INDEX idx_sales_org_date     ON sales(organization_id, created_at);

    -- =========================
    -- SALE ITEMS
    -- =========================
    CREATE TABLE sale_items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        sale_id         INTEGER NOT NULL REFERENCES sales(id)    ON DELETE CASCADE,
        article_id      INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        quantity        INTEGER NOT NULL,
        quantity_type   TEXT    NOT NULL DEFAULT 'UNIT'
                                CHECK (quantity_type IN ('PACK','UNIT')),
        unit_price      REAL    NOT NULL,
        discount        REAL    NOT NULL DEFAULT 0,
        subtotal        REAL    NOT NULL,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_sale_items_sale    ON sale_items(sale_id);
    CREATE INDEX idx_sale_items_article ON sale_items(article_id);

    -- =========================
    -- CASH INPUTS
    -- =========================
    CREATE TABLE cash_inputs (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        cash_register_id    INTEGER NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
        sale_id             INTEGER REFERENCES sales(id) ON DELETE SET NULL,
        user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount              REAL    NOT NULL,
        source              TEXT    NOT NULL DEFAULT 'SALE'
                                    CHECK (source IN ('SALE','DEPOSIT','REFUND','OTHER')),
        reference           TEXT,
        notes               TEXT,
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_cash_inputs_reg ON cash_inputs(cash_register_id, created_at);

    -- =========================
    -- CASH OUTPUTS
    -- =========================
    CREATE TABLE cash_outputs (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        cash_register_id    INTEGER NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
        user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount              REAL    NOT NULL,
        reason              TEXT    NOT NULL,
        beneficiary         TEXT,
        reference           TEXT,
        notes               TEXT,
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_cash_outputs_reg ON cash_outputs(cash_register_id, created_at);

    -- =========================
    -- COMPTEUR DE RÉFÉRENCE (factures, bons, etc.)
    -- =========================
    CREATE TABLE sequences (
        key         TEXT    PRIMARY KEY,   -- ex: 'sale', 'stock_movement'
        last_value  INTEGER NOT NULL DEFAULT 0,
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    `,
];