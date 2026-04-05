import { usePage } from '@inertiajs/react';

type SharedOrganization = {
    currency?: string | null;
    base_currency?: string | null;
    exchange_rate?: number | null;
};

const localeByCurrency: Record<string, string> = {
    CDF: 'fr-CD',
    USD: 'en-US',
    EUR: 'fr-FR',
    XAF: 'fr-CM',
};

export function formatMoney(
    amount?: number | string,
    currency = 'CDF',
): string {
    return new Intl.NumberFormat(localeByCurrency[currency] ?? 'fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(Number(amount ?? 0));
}

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
    const page = usePage<{ organization?: SharedOrganization | null }>();
    const currency = page.props.organization?.currency || 'CDF';
    const baseCurrency = page.props.organization?.base_currency || currency;
    const exchangeRate = Number(page.props.organization?.exchange_rate || 1);

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
        formatCurrency: (
            amount?: number | string,
            overrideCurrency?: string,
        ) => {
            if (overrideCurrency) {
                return formatMoney(amount, overrideCurrency);
            }

            return formatMoney(convertAmount(amount), currency);
        },
        formatRawCurrency: (amount?: number | string, rawCurrency?: string) =>
            formatMoney(amount, rawCurrency || currency),
    };
}
