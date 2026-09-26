// src/screens/settings/PrinterScreen.tsx
import * as React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Bluetooth,
    CheckCircle2,
    Printer,
    RefreshCw,
    Trash2,
} from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import {
    PrinterService,
    type DiscoveredPrinter,
} from '../../lib/printerNative';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    emerald: '#047857',
    rose: '#B91C1C',
};

export default function PrinterScreen() {
    const { formatCurrency } = useOrganizationCurrency();
    const [devices, setDevices] = React.useState<DiscoveredPrinter[]>([]);
    const [scanning, setScanning] = React.useState(false);
    const [selected, setSelected] = React.useState<string | null>(null);
    const [testing, setTesting] = React.useState(false);

    // Charge l'adresse mémorisée au montage
    React.useEffect(() => {
        (async () => {
            const addr = await PrinterService.getAddress();
            setSelected(addr);
        })();
    }, []);

    const startScan = async () => {
        setScanning(true);
        setDevices([]);
        try {
            const found = await PrinterService.scanPrinters(5000);
            setDevices(found);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de scanner le Bluetooth.');
        } finally {
            setScanning(false);
        }
    };

    const handleSelect = async (device: DiscoveredPrinter) => {
        const ok = await PrinterService.connect(device.address, device.type);
        if (ok) {
            await PrinterService.saveAddress(device.address, device.type);
            setSelected(device.address);
            Alert.alert('Succès', `Imprimante « ${device.name} » enregistrée.`);
        } else {
            Alert.alert(
                'Erreur',
                "Impossible de se connecter. Vérifie qu'elle est allumée et à portée.",
            );
        }
    };

    const handleForget = async () => {
        Alert.alert(
            'Oublier',
            "Retirer l'imprimante enregistrée ?",
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Oui',
                    style: 'destructive',
                    onPress: async () => {
                        await PrinterService.saveAddress(null);
                        setSelected(null);
                    },
                },
            ],
        );
    };

    const handleTestPrint = async () => {
        if (!selected) {
            Alert.alert('Aucune imprimante', 'Sélectionne d’abord une imprimante.');
            return;
        }
        setTesting(true);
        try {
            const now = new Date().toISOString();
            const result = await PrinterService.printReceipt(
                {
                    id: 0,
                    organization_id: 1,
                    user_id: 1,
                    user_name: 'Testeur',
                    cash_register_id: 1,
                    reference: 'TEST-0001',
                    subtotal: 1000,
                    discount: 0,
                    tax: 0,
                    total_amount: 1000,
                    payment_method: 'CASH',
                    payment_status: 'PAID',
                    amount_paid: 1000,
                    change_amount: 0,
                    customer_name: 'Client test',
                    customer_phone: null,
                    notes: null,
                    created_at: now,
                    updated_at: now,
                    deleted_at: null,
                },
                [
                    {
                        id: 0,
                        organization_id: 1,
                        sale_id: 0,
                        article_id: 0,
                        article_name: 'Article test',
                        article_sku: null,
                        article_units_per_pack: null,
                        quantity: 1,
                        quantity_type: 'UNIT',
                        unit_price: 1000,
                        discount: 0,
                        subtotal: 1000,
                        created_at: now,
                        updated_at: now,
                    },
                ],
                'Ma Boutique',
                formatCurrency,
            );
            if (result.success) {
                Alert.alert('OK', 'Test d’impression envoyé.');
            } else {
                Alert.alert('Erreur', result.error ?? 'Impression échouée.');
            }
        } catch (e) {
            Alert.alert(
                'Erreur',
                e instanceof Error ? e.message : 'Erreur lors du test.',
            );
        } finally {
            setTesting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <FlatList
                data={devices}
                keyExtractor={(item) => item.address}
                contentContainerStyle={styles.content}
                ListHeaderComponent={
                    <View style={{ gap: 16 }}>
                        <View style={styles.header}>
                            <Badge variant="secondary">Imprimante</Badge>
                            <Text style={styles.h1}>Imprimante thermique</Text>
                            <Text style={styles.subtitle}>
                                Sélectionne et teste ton imprimante Bluetooth ESC/POS.
                            </Text>
                        </View>

                        {selected ? (
                            <View style={styles.selectedBox}>
                                <CheckCircle2 size={18} color={P.emerald} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.selectedText}>
                                        Imprimante enregistrée
                                    </Text>
                                    <Text style={styles.selectedAddr}>
                                        {selected}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={handleForget}
                                    style={styles.forgetBtn}
                                >
                                    <Trash2 size={16} color={P.rose} />
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.noPrinterBox}>
                                <Text style={styles.muted}>
                                    Aucune imprimante configurée.
                                </Text>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Button
                                variant="outline"
                                onPress={startScan}
                                loading={scanning}
                                leftIcon={<RefreshCw size={16} color="#18181B" />}
                                style={{ flex: 1 }}
                            >
                                Scanner
                            </Button>
                            <Button
                                onPress={handleTestPrint}
                                loading={testing}
                                leftIcon={<Printer size={16} color="#FAFAFA" />}
                                style={{ flex: 1 }}
                            >
                                Tester
                            </Button>
                        </View>

                        <Text style={styles.listTitle}>
                            Imprimantes détectées ({devices.length})
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => handleSelect(item)}
                        style={({ pressed }) => [
                            styles.deviceRow,
                            item.address === selected && styles.deviceRowSelected,
                            pressed && { opacity: 0.9 },
                        ]}
                    >
                        <Bluetooth size={18} color={P.fg} />
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={styles.deviceName} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text style={styles.deviceAddr} numberOfLines={1}>
                                {item.address}
                            </Text>
                        </View>
                        {item.address === selected ? (
                            <CheckCircle2 size={18} color={P.emerald} />
                        ) : null}
                    </Pressable>
                )}
                ListEmptyComponent={
                    scanning ? (
                        <View style={styles.emptyBox}>
                            <ActivityIndicator />
                            <Text style={styles.muted}>Recherche en cours…</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyBox}>
                            <Text style={styles.muted}>
                                {devices.length === 0
                                    ? 'Appuie sur « Scanner » pour détecter les imprimantes autour de toi.'
                                    : ''}
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 12, paddingBottom: 40 },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    subtitle: { fontSize: 14, color: P.muted },

    selectedBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    selectedText: { color: P.emerald, fontWeight: '700', fontSize: 13 },
    selectedAddr: { color: P.emerald, fontSize: 12, marginTop: 2 },
    forgetBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noPrinterBox: {
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: P.border,
        alignItems: 'center',
    },

    listTitle: {
        fontSize: 12,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 8,
    },
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        backgroundColor: P.card,
        borderWidth: 1,
        borderColor: P.border,
        marginBottom: 8,
    },
    deviceRowSelected: { borderColor: P.emerald, backgroundColor: '#ECFDF5' },
    deviceName: { fontSize: 15, fontWeight: '700', color: P.fg },
    deviceAddr: { fontSize: 12, color: P.muted, marginTop: 2 },
    emptyBox: { padding: 32, alignItems: 'center', gap: 8 },
    muted: { fontSize: 13, color: P.muted, textAlign: 'center' },
});