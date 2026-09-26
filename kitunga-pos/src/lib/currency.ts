// src/lib/currency.ts

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