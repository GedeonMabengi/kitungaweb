// src/data/types/cash.ts
export type CashRegisterStatus = 'OPEN' | 'CLOSED';
export type CashInputSource = 'SALE' | 'DEPOSIT' | 'REFUND' | 'OTHER';

export type CashRegister = {
    id: number;
    organization_id: number | null;
    user_id: number;
    date: string;
    opening_balance: number;
    total_input: number;
    total_output: number;
    expected_balance: number;
    actual_balance: number | null;
    difference: number | null;
    status: CashRegisterStatus;
    opened_at: string;
    closed_at: string | null;
    opening_notes: string | null;
    closing_notes: string | null;
    created_at: string;
    updated_at: string;
};

export type CashRegisterRow = CashRegister & {
    user_name: string | null;
};

export type CashInput = {
    id: number;
    organization_id: number | null;
    cash_register_id: number;
    sale_id: number | null;
    user_id: number;
    amount: number;
    source: CashInputSource;
    reference: string | null;
    notes: string | null;
    created_at: string;
};

export type CashOutput = {
    id: number;
    organization_id: number | null;
    cash_register_id: number;
    user_id: number;
    amount: number;
    reason: string;
    beneficiary: string | null;
    reference: string | null;
    notes: string | null;
    created_at: string;
};

export type CashMovement = {
    kind: 'input' | 'output';
    id: number;
    amount: number;
    label: string;
    reference: string | null;
    notes: string | null;
    created_at: string;
    source?: CashInputSource;
    reason?: string;
    beneficiary?: string | null;
};

export type CashFilters = {
    status?: '' | CashRegisterStatus;
    start_date?: string; // YYYY-MM-DD
    end_date?: string;
};

export const INPUT_SOURCE_LABELS: Record<CashInputSource, string> = {
    SALE: 'Vente',
    DEPOSIT: 'Dépôt',
    REFUND: 'Remboursement',
    OTHER: 'Autre',
};