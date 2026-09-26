// src/hooks/useOrganizationCurrency.ts
import { useOrganizationStore } from '../store/organization.store';
import { formatMoney } from '../lib/currency';

export function useOrganizationCurrency(): {
    currency: string;
    baseCurrency: string;
    exchangeRate: number;
    convertAmount: (amount?: number | string) => number;
    formatCurrency: (
        amount?: number | string,
        overrideCurrency?: string,
    ) => string;
    formatRawCurrency: (
        amount?: number | string,
        rawCurrency?: string,
    ) => string;
} {
    const organization = useOrganizationStore((s) => s.organization);

    const currency = organization?.currency || 'CDF';
    const baseCurrency = organization?.base_currency || currency;
    const exchangeRate = Number(organization?.exchange_rate || 1);

    const convertAmount = (amount?: number | string): number => {
        const numericAmount = Number(amount ?? 0);

        if (baseCurrency === currency) {
            return numericAmount;
        }

        return numericAmount * exchangeRate;
    };

    return {
        currency,
        baseCurrency,
        exchangeRate,
        convertAmount,
        formatCurrency: (amount, overrideCurrency) => {
            if (overrideCurrency) {
                return formatMoney(amount, overrideCurrency);
            }
            return formatMoney(convertAmount(amount), currency);
        },
        formatRawCurrency: (amount, rawCurrency) =>
            formatMoney(amount, rawCurrency || currency),
    };
}