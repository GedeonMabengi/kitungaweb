import * as Print from 'expo-print';
import type { SaleItemRow, SaleRow } from '../data/types/sale';

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatDate(value: string): string {
    return new Date(value).toLocaleString('fr-FR');
}

export function buildReceiptHtml(
    sale: SaleRow,
    items: SaleItemRow[],
    organizationName: string,
    formatCurrency: (amount: number) => string,
): string {
    const rows = items
        .map(
            (item) => `
                <tr>
                    <td>
                        <strong>${escapeHtml(item.article_name ?? 'Article')}</strong><br />
                        <small>${item.quantity} ${escapeHtml(item.quantity_type)} × ${escapeHtml(formatCurrency(item.unit_price))}</small>
                    </td>
                    <td class="amount">${escapeHtml(formatCurrency(item.subtotal))}</td>
                </tr>`,
        )
        .join('');

    return `<!DOCTYPE html>
        <html lang="fr">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                    @page { margin: 0; size: 58mm auto; }
                    * { box-sizing: border-box; }
                    body { width: 58mm; margin: 0 auto; padding: 5mm 3mm; color: #111; font-family: Arial, sans-serif; font-size: 11px; }
                    h1 { margin: 0 0 8px; font-size: 16px; text-align: center; }
                    .meta { margin: 2px 0; text-align: center; }
                    .separator { margin: 8px 0; border-top: 1px dashed #111; }
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 3px 0; vertical-align: top; }
                    .amount { text-align: right; white-space: nowrap; }
                    .total td { padding-top: 8px; font-size: 14px; font-weight: bold; }
                    .footer { margin-top: 14px; text-align: center; }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(organizationName)}</h1>
                <div class="meta">Réf : ${escapeHtml(sale.reference)}</div>
                <div class="meta">${escapeHtml(formatDate(sale.created_at))}</div>
                ${sale.user_name ? `<div class="meta">Vendeur : ${escapeHtml(sale.user_name)}</div>` : ''}
                ${sale.customer_name ? `<div class="meta">Client : ${escapeHtml(sale.customer_name)}</div>` : ''}
                <div class="separator"></div>
                <table>${rows}</table>
                <div class="separator"></div>
                <table>
                    <tr><td>Sous-total</td><td class="amount">${escapeHtml(formatCurrency(sale.subtotal))}</td></tr>
                    ${sale.discount > 0 ? `<tr><td>Remise</td><td class="amount">-${escapeHtml(formatCurrency(sale.discount))}</td></tr>` : ''}
                    ${sale.tax > 0 ? `<tr><td>Taxe</td><td class="amount">${escapeHtml(formatCurrency(sale.tax))}</td></tr>` : ''}
                    <tr class="total"><td>TOTAL</td><td class="amount">${escapeHtml(formatCurrency(sale.total_amount))}</td></tr>
                    <tr><td>Payé</td><td class="amount">${escapeHtml(formatCurrency(sale.amount_paid))}</td></tr>
                    <tr><td>Rendu</td><td class="amount">${escapeHtml(formatCurrency(sale.change_amount))}</td></tr>
                </table>
                <div class="footer">Merci de votre visite !</div>
            </body>
        </html>`;
}

export const SystemPrinterService = {
    async printReceipt(
        sale: SaleRow,
        items: SaleItemRow[],
        organizationName: string,
        formatCurrency: (amount: number) => string,
    ): Promise<void> {
        await Print.printAsync({
            html: buildReceiptHtml(
                sale,
                items,
                organizationName,
                formatCurrency,
            ),
        });
    },
};
