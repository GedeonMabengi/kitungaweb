// src/lib/printer.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExpoBluetoothPrinter, {
    type BluetoothDevice,
} from 'expo-bluetooth-printer';
import type { SaleRow, SaleItemRow } from '../data/types/sale';

const STORAGE_KEY = '@kitunga/printer_address';
const TYPE_STORAGE_KEY = '@kitunga/printer_type';

export type PrintResult = {
    success: boolean;
    error?: string;
};

export type DiscoveredPrinter = {
    name: string;
    address: string;
    type: BluetoothDevice['type'];
};

let cachedAddress: string | null = null;
let cachedType: BluetoothDevice['type'] = 'classic';

export const PrinterService = {
    // -------------------------------------------------------------
    // Persistance de l'adresse MAC
    // -------------------------------------------------------------
    async loadAddress(): Promise<string | null> {
        if (cachedAddress) return cachedAddress;
        try {
            const v = await AsyncStorage.getItem(STORAGE_KEY);
            cachedAddress = v;
            return v;
        } catch {
            return null;
        }
    },

    async saveAddress(
        address: string | null,
        type: BluetoothDevice['type'] = 'classic',
    ): Promise<void> {
        cachedAddress = address;
        cachedType = type;
        try {
            if (address) {
                await AsyncStorage.setItem(STORAGE_KEY, address);
                await AsyncStorage.setItem(TYPE_STORAGE_KEY, type);
            } else {
                await AsyncStorage.removeItem(STORAGE_KEY);
                await AsyncStorage.removeItem(TYPE_STORAGE_KEY);
            }
        } catch (e) {
            console.error('[PrinterService] saveAddress error', e);
        }
    },

    async getAddress(): Promise<string | null> {
        return this.loadAddress();
    },

    // -------------------------------------------------------------
    // Bluetooth state & scan
    // -------------------------------------------------------------
    async isBluetoothEnabled(): Promise<boolean> {
        try {
            const anyLib = ExpoBluetoothPrinter as any;
            if (typeof anyLib.isBluetoothEnabled === 'function') {
                return await anyLib.isBluetoothEnabled();
            }
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Lance un scan Bluetooth. Renvoie la liste des imprimantes trouvées.
     * Le scan dure ~5 secondes, on utilise un listener d'événements.
     */
    async scanPrinters(timeoutMs = 5000): Promise<DiscoveredPrinter[]> {
        const anyLib = ExpoBluetoothPrinter as any;
        const found = new Map<string, DiscoveredPrinter>();

        return new Promise<DiscoveredPrinter[]>((resolve) => {
            let finished = false;

            const cleanup = () => {
                if (finished) return;
                finished = true;
                try {
                    anyLib.stopScan?.();
                } catch {}
                try {
                    anyLib.removeListeners?.();
                } catch {}
                resolve(Array.from(found.values()));
            };

            try {
                // Écoute des imprimantes découvertes
                if (anyLib.onDeviceFound) {
                    anyLib.onDeviceFound((device: any) => {
                        if (!device?.address) return;
                        found.set(device.address, {
                            name: device.name || device.deviceName || 'Imprimante',
                            address: device.address,
                            type: device.type === 'ble' ? 'ble' : 'classic',
                        });
                    });
                }

                if (anyLib.onScanFinished) {
                    anyLib.onScanFinished(() => cleanup());
                }

                // Démarrage
                if (typeof anyLib.scanForBtDevices === 'function') {
                    anyLib.scanForBtDevices();
                } else if (typeof anyLib.startScan === 'function') {
                    anyLib.startScan();
                }

                // Timeout de sécurité
                setTimeout(cleanup, timeoutMs);
            } catch (e) {
                console.error('[PrinterService] scan error', e);
                cleanup();
            }
        });
    },

    // -------------------------------------------------------------
    // Connexion / déconnexion
    // -------------------------------------------------------------
    async connect(address: string): Promise<boolean> {
        try {
            const anyLib = ExpoBluetoothPrinter as any;

            // Différentes signatures possibles selon la lib installée
            if (typeof anyLib.connectToDevice === 'function') {
                await anyLib.connectToDevice('Thermal Printer', address, 'classic');
                return true;
            }
            if (typeof anyLib.connectPrinter === 'function') {
                await anyLib.connectPrinter(address);
                return true;
            }
            if (typeof anyLib.connect === 'function') {
                await anyLib.connect(address);
                return true;
            }
            return false;
        } catch (e) {
            console.error('[PrinterService] connect error', e);
            return false;
        }
    },

    async disconnect(): Promise<void> {
        try {
            const anyLib = ExpoBluetoothPrinter as any;
            if (typeof anyLib.disconnectFromDevice === 'function') {
                await anyLib.disconnectFromDevice();
            } else if (typeof anyLib.disconnectPrinter === 'function') {
                await anyLib.disconnectPrinter();
            }
        } catch {}
    },

    // -------------------------------------------------------------
    // Helpers d'écriture
    // -------------------------------------------------------------
    async _text(txt: string, align: 'left' | 'center' | 'right' = 'left') {
        const anyLib = ExpoBluetoothPrinter as any;
        if (typeof anyLib.printText === 'function') {
            return anyLib.printText(txt, align);
        }
        if (typeof anyLib.printRaw === 'function') {
            return anyLib.printRaw(txt);
        }
    },

    async _separator() {
        const anyLib = ExpoBluetoothPrinter as any;
        if (typeof anyLib.printSeparator === 'function') {
            return anyLib.printSeparator();
        }
        await this._text('--------------------------------');
    },

    async _labelValue(label: string, value: string) {
        const anyLib = ExpoBluetoothPrinter as any;
        if (typeof anyLib.printLabelValue === 'function') {
            return anyLib.printLabelValue(label, value);
        }
        const line = `${label}${' '.repeat(Math.max(1, 32 - label.length - value.length))}${value}`;
        await this._text(line);
    },

    async _skipLines(n: number) {
        const anyLib = ExpoBluetoothPrinter as any;
        if (typeof anyLib.skipLines === 'function') {
            return anyLib.skipLines(n);
        }
        for (let i = 0; i < n; i++) await this._text('');
    },

    async _close() {
        const anyLib = ExpoBluetoothPrinter as any;
        if (typeof anyLib.closePrinter === 'function') {
            await anyLib.closePrinter();
        }
    },

    // -------------------------------------------------------------
    // Impression du reçu
    // -------------------------------------------------------------
    async printReceipt(
        sale: SaleRow,
        items: SaleItemRow[],
        organizationName: string,
        formatCurrency: (amount: number) => string,
    ): Promise<PrintResult> {
        const address = await this.loadAddress();
        if (!address) {
            return {
                success: false,
                error:
                    "Aucune imprimante configurée. Va dans Paramètres → Imprimante.",
            };
        }

        const btEnabled = await this.isBluetoothEnabled();
        if (!btEnabled) {
            return {
                success: false,
                error: 'Le Bluetooth est désactivé.',
            };
        }

        const connected = await this.connect(address);
        if (!connected) {
            return {
                success: false,
                error:
                    "Impossible de se connecter à l'imprimante. Vérifie qu'elle est allumée et à portée.",
            };
        }

        try {
            await this._text(organizationName, 'center');
            await this._separator();

            await this._text(`Réf: ${sale.reference}`);
            await this._text(
                `Date: ${new Date(sale.created_at).toLocaleString('fr-FR')}`,
            );
            if (sale.user_name) await this._text(`Vendeur: ${sale.user_name}`);
            if (sale.customer_name)
                await this._text(`Client: ${sale.customer_name}`);
            await this._separator();

            for (const item of items) {
                await this._text(item.article_name ?? 'Article');
                await this._text(
                    `  ${item.quantity} ${item.quantity_type} x ${formatCurrency(
                        item.unit_price,
                    )}`,
                );
                await this._labelValue('', formatCurrency(item.subtotal));
            }

            await this._separator();
            await this._labelValue('Sous-total', formatCurrency(sale.subtotal));
            if (sale.discount > 0) {
                await this._labelValue(
                    'Remise',
                    `-${formatCurrency(sale.discount)}`,
                );
            }
            await this._separator();
            await this._labelValue('TOTAL', formatCurrency(sale.total_amount));
            await this._labelValue('Payé', formatCurrency(sale.amount_paid));
            await this._labelValue('Rendu', formatCurrency(sale.change_amount));

            await this._skipLines(2);
            await this._text('Merci de votre visite !', 'center');
            await this._skipLines(2);
            await this._close();

            return { success: true };
        } catch (e) {
            console.error('[PrinterService] print error', e);
            return {
                success: false,
                error:
                    e instanceof Error
                        ? e.message
                        : "Erreur lors de l'impression.",
            };
        } finally {
            await this.disconnect();
        }
    },
};