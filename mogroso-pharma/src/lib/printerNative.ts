import AsyncStorage from '@react-native-async-storage/async-storage';
import ExpoBluetoothPrinter, {
    type BluetoothDevice,
} from 'expo-bluetooth-printer';
import type { SaleItemRow, SaleRow } from '../data/types/sale';

const ADDRESS_KEY = '@kitunga/printer_address';
const TYPE_KEY = '@kitunga/printer_type';

export type PrintResult = { success: boolean; error?: string };

export type DiscoveredPrinter = {
    name: string;
    address: string;
    type: BluetoothDevice['type'];
};

let cachedAddress: string | null = null;
let cachedType: BluetoothDevice['type'] = 'classic';

async function getPrinterType(): Promise<BluetoothDevice['type']> {
    if (cachedAddress) return cachedType;
    try {
        cachedType = (await AsyncStorage.getItem(TYPE_KEY)) === 'ble' ? 'ble' : 'classic';
    } catch {
        cachedType = 'classic';
    }
    return cachedType;
}

export const PrinterService = {
    async getAddress(): Promise<string | null> {
        if (cachedAddress) return cachedAddress;
        cachedAddress = await AsyncStorage.getItem(ADDRESS_KEY);
        return cachedAddress;
    },

    async saveAddress(
        address: string | null,
        type: BluetoothDevice['type'] = 'classic',
    ): Promise<void> {
        cachedAddress = address;
        cachedType = type;
        if (address) {
            await AsyncStorage.setItem(ADDRESS_KEY, address);
            await AsyncStorage.setItem(TYPE_KEY, type);
        } else {
            await AsyncStorage.removeItem(ADDRESS_KEY);
            await AsyncStorage.removeItem(TYPE_KEY);
        }
    },

    async isBluetoothEnabled(): Promise<boolean> {
        try {
            return ExpoBluetoothPrinter.isBluetoothEnabled();
        } catch {
            return false;
        }
    },

    async scanPrinters(timeoutMs = 8000): Promise<DiscoveredPrinter[]> {
        const found = new Map<string, DiscoveredPrinter>();

        return new Promise((resolve) => {
            let finished = false;
            const subscription = ExpoBluetoothPrinter.addListener(
                'onDeviceFound',
                (payload) => {
                    const devices = Array.isArray(payload.devices)
                        ? payload.devices
                        : [payload as unknown as BluetoothDevice];

                    for (const device of devices) {
                        if (!device?.address) continue;
                        found.set(device.address, {
                            name: device.name || 'Imprimante',
                            address: device.address,
                            type: device.type === 'ble' ? 'ble' : 'classic',
                        });
                    }
                },
            );

            const finish = () => {
                if (finished) return;
                finished = true;
                subscription.remove();
                resolve(Array.from(found.values()));
            };

            if (!ExpoBluetoothPrinter.hasBluetoothPermissions()) {
                ExpoBluetoothPrinter.requestPermissions();
            }

            void (async () => {
                for (const deviceName of ['SP02', 'H10S', '']) {
                    try {
                        await ExpoBluetoothPrinter.scanForBtDevices(deviceName);
                    } catch (error) {
                        console.warn('[PrinterService] scan attempt failed', error);
                    }
                }
                finish();
            })();

            setTimeout(finish, timeoutMs);
        });
    },

    async connect(
        address: string,
        type: BluetoothDevice['type'] = 'classic',
    ): Promise<boolean> {
        try {
            await ExpoBluetoothPrinter.connectToDevice('Thermal Printer', address, type);
            return true;
        } catch (error) {
            console.error('[PrinterService] connect error', error);
            return false;
        }
    },

    async disconnect(): Promise<void> {
        try {
            await ExpoBluetoothPrinter.disconnectFromDevice();
        } catch {
            // La déconnexion est idempotente pour l'écran de configuration.
        }
    },

    async printReceipt(
        sale: SaleRow,
        items: SaleItemRow[],
        organizationName: string,
        formatCurrency: (amount: number) => string,
    ): Promise<PrintResult> {
        const address = await this.getAddress();
        if (!address) {
            return {
                success: false,
                error: 'Aucune imprimante configurée. Va dans Paramètres → Imprimante.',
            };
        }
        if (!(await this.isBluetoothEnabled())) {
            return { success: false, error: 'Le Bluetooth est désactivé.' };
        }
        if (!(await this.connect(address, await getPrinterType()))) {
            return {
                success: false,
                error: "Impossible de se connecter à l'imprimante.",
            };
        }

        try {
            await ExpoBluetoothPrinter.printText(organizationName, 'center');
            await ExpoBluetoothPrinter.printSeparator();
            await ExpoBluetoothPrinter.printText(`Réf: ${sale.reference}`);
            await ExpoBluetoothPrinter.printText(
                `Date: ${new Date(sale.created_at).toLocaleString('fr-FR')}`,
            );
            if (sale.user_name) await ExpoBluetoothPrinter.printText(`Vendeur: ${sale.user_name}`);
            if (sale.customer_name) await ExpoBluetoothPrinter.printText(`Client: ${sale.customer_name}`);
            await ExpoBluetoothPrinter.printSeparator();

            for (const item of items) {
                await ExpoBluetoothPrinter.printText(item.article_name ?? 'Article');
                await ExpoBluetoothPrinter.printText(
                    `  ${item.quantity} ${item.quantity_type} x ${formatCurrency(item.unit_price)}`,
                );
                await ExpoBluetoothPrinter.printLabelValue('', formatCurrency(item.subtotal));
            }

            await ExpoBluetoothPrinter.printSeparator();
            await ExpoBluetoothPrinter.printLabelValue('Sous-total', formatCurrency(sale.subtotal));
            if (sale.discount > 0) {
                await ExpoBluetoothPrinter.printLabelValue('Remise', `-${formatCurrency(sale.discount)}`);
            }
            await ExpoBluetoothPrinter.printSeparator();
            await ExpoBluetoothPrinter.printLabelValue('TOTAL', formatCurrency(sale.total_amount));
            await ExpoBluetoothPrinter.printLabelValue('Payé', formatCurrency(sale.amount_paid));
            await ExpoBluetoothPrinter.printLabelValue('Rendu', formatCurrency(sale.change_amount));
            await ExpoBluetoothPrinter.skipLines(2);
            await ExpoBluetoothPrinter.printText('Merci de votre visite !', 'center');
            await ExpoBluetoothPrinter.skipLines(2);
            await ExpoBluetoothPrinter.closePrinter();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Erreur lors de l'impression.",
            };
        } finally {
            await this.disconnect();
        }
    },
};
