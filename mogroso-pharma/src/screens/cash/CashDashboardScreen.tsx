// src/screens/cash/CashDashboardScreen.tsx
import * as React from 'react';
import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Banknote,
    CircleDollarSign,
    Lock,
} from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetHeader,
    BottomSheetTitle,
} from '../../components/ui/BottomSheet';
import { Skeleton } from '../../components/ui/Skeleton';
import { FormField } from '../../components/forms/FormField';
import AlertError from '../../components/forms/AlertError';
import { useForm } from '../../hooks/useForm';
import { useCashDashboard } from '../../hooks/useCash';
import { useOrganizationCurrency } from '../../hooks/useOrganizationCurrency';
import { useOrganizationStore } from '../../store/organization.store';
import { useSessionStore } from '../../store/session.store';
import { useAuthorization } from '../../lib/authorization';
import { CashRepo } from '../../data/repositories/cash.repo';
import type {
    CashInputSource,
    CashMovement,
} from '../../data/types/cash';

const P = {
    bg: '#FAFAFA',
    fg: '#18181B',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
    dark: '#0F172A',
    emerald: '#047857',
    rose: '#B91C1C',
    amber: '#B45309',
};

type Panel = 'open' | 'close' | 'input' | 'output' | null;

// Map LOCAL — pas d'import fragile
const SOURCE_LABELS: Record<string, string> = {
    SALE: 'Vente',
    DEPOSIT: 'Dépôt',
    REFUND: 'Remboursement',
    OTHER: 'Autre',
};

export default function CashDashboardScreen() {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const userId = useSessionStore((s) => s.user?.id ?? 1);
    const { hasPermission } = useAuthorization();
    const { formatCurrency } = useOrganizationCurrency();

    const {
        openRegister,
        lastClosed,
        movements,
        loading,
        refreshing,
        refresh,
        error,
    } = useCashDashboard();

    const [activePanel, setActivePanel] = React.useState<Panel>(null);
    const [globalErrors, setGlobalErrors] = React.useState<string[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh]),
    );

    const canOpenRegister = hasPermission('cash.open');
    const canCloseRegister = hasPermission('cash.close');
    const canAddInput =
        hasPermission('cash.input') || hasPermission('cash.manage');
    const canAddOutput =
        hasPermission('cash.output') || hasPermission('cash.manage');

    const hasActiveRegister = !!openRegister;

    const currentBalance = React.useMemo(() => {
        if (!openRegister) return 0;
        return (
            Number(openRegister.opening_balance) +
            Number(openRegister.total_input) -
            Number(openRegister.total_output)
        );
    }, [openRegister]);

    // Formulaires
    const openForm = useForm({ opening_balance: '', notes: '' });
    const closeForm = useForm({ actual_balance: '', notes: '' });
    const inputForm = useForm({
        amount: '',
        source: 'DEPOSIT' as CashInputSource,
        reference: '',
        notes: '',
    });
    const outputForm = useForm({
        amount: '',
        reason: '',
        beneficiary: '',
        reference: '',
        notes: '',
    });

    // Pré-remplir le solde d'ouverture
    React.useEffect(() => {
        if (
            !hasActiveRegister &&
            lastClosed?.actual_balance != null &&
            !openForm.data.opening_balance
        ) {
            openForm.setData(
                'opening_balance',
                String(lastClosed.actual_balance),
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasActiveRegister, lastClosed]);

    const handleError = (e: unknown) => {
        setGlobalErrors([
            e instanceof Error ? e.message : 'Une erreur est survenue.',
        ]);
    };

    const submitOpen = async () => {
        setGlobalErrors([]);
        const amount = Number(openForm.data.opening_balance);
        if (!openForm.data.opening_balance || isNaN(amount) || amount < 0) {
            setGlobalErrors(['Saisis un solde d’ouverture valide.']);
            return;
        }
        try {
            await CashRepo.open({
                organization_id: orgId,
                user_id: userId,
                opening_balance: amount,
                notes: openForm.data.notes.trim() || null,
            });
            openForm.reset();
            setActivePanel(null);
            refresh();
        } catch (e) {
            handleError(e);
        }
    };

    const submitClose = async () => {
        if (!openRegister) return;
        setGlobalErrors([]);
        const actual = Number(closeForm.data.actual_balance);
        if (
            closeForm.data.actual_balance === '' ||
            isNaN(actual) ||
            actual < 0
        ) {
            setGlobalErrors(['Saisis un solde réel valide.']);
            return;
        }
        try {
            await CashRepo.close({
                registerId: openRegister.id,
                actual_balance: actual,
                notes: closeForm.data.notes.trim() || null,
            });
            closeForm.reset();
            setActivePanel(null);
            refresh();
        } catch (e) {
            handleError(e);
        }
    };

    const submitInput = async () => {
        if (!openRegister) return;
        setGlobalErrors([]);
        const amount = Number(inputForm.data.amount);
        if (!inputForm.data.amount || isNaN(amount) || amount <= 0) {
            setGlobalErrors(['Montant invalide.']);
            return;
        }
        try {
            await CashRepo.addInput({
                registerId: openRegister.id,
                organization_id: orgId,
                user_id: userId,
                amount,
                source: inputForm.data.source,
                reference: inputForm.data.reference.trim() || null,
                notes: inputForm.data.notes.trim() || null,
            });
            inputForm.reset();
            setActivePanel(null);
            refresh();
        } catch (e) {
            handleError(e);
        }
    };

    const submitOutput = async () => {
        if (!openRegister) return;
        setGlobalErrors([]);
        const amount = Number(outputForm.data.amount);
        if (!outputForm.data.amount || isNaN(amount) || amount <= 0) {
            setGlobalErrors(['Montant invalide.']);
            return;
        }
        if (!outputForm.data.reason.trim()) {
            setGlobalErrors(['Le motif est obligatoire.']);
            return;
        }
        try {
            await CashRepo.addOutput({
                registerId: openRegister.id,
                organization_id: orgId,
                user_id: userId,
                amount,
                reason: outputForm.data.reason.trim(),
                beneficiary: outputForm.data.beneficiary.trim() || null,
                reference: outputForm.data.reference.trim() || null,
                notes: outputForm.data.notes.trim() || null,
            });
            outputForm.reset();
            setActivePanel(null);
            refresh();
        } catch (e) {
            handleError(e);
        }
    };

    if (loading && !refreshing) {
        return (
            <ScrollView contentContainerStyle={styles.content}>
                <Skeleton height={180} borderRadius={16} />
                <Skeleton height={100} borderRadius={12} />
                <Skeleton height={200} borderRadius={12} />
            </ScrollView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {error ? <AlertError errors={[error]} title="Erreur" /> : null}

                <View style={styles.header}>
                    <Badge variant="secondary">Caisse</Badge>
                    <Text style={styles.h1}>Pilotage des flux de caisse</Text>
                    <Text style={styles.subtitle}>
                        Ouvre, alimente, débourse puis clôture la caisse.
                    </Text>
                </View>

                {!hasActiveRegister ? (
                    <Card>
                        <CardContent>
                            <View style={styles.emptyHero}>
                                <View style={styles.heroIconAmber}>
                                    <Banknote size={28} color={P.amber} />
                                </View>
                                <Text style={styles.heroTitle}>
                                    Aucune caisse ouverte
                                </Text>
                                <Text style={styles.heroText}>
                                    Démarre la journée avec un solde initial,
                                    puis ajoute les entrées et sorties.
                                </Text>

                                {lastClosed?.actual_balance != null ? (
                                    <View style={styles.lastCloseBox}>
                                        <Text style={styles.lastCloseLabel}>
                                            DERNIÈRE CLÔTURE
                                        </Text>
                                        <Text style={styles.lastCloseValue}>
                                            {formatCurrency(
                                                lastClosed.actual_balance,
                                            )}
                                        </Text>
                                        <Text style={styles.lastCloseHint}>
                                            Clôturée le {lastClosed.date}.
                                        </Text>
                                    </View>
                                ) : null}

                                {canOpenRegister ? (
                                    <Button
                                        onPress={() => setActivePanel('open')}
                                        style={{ marginTop: 16 }}
                                    >
                                        Ouvrir la caisse
                                    </Button>
                                ) : (
                                    <Text style={styles.muted}>
                                        Ton profil n’a pas la permission d’ouvrir
                                        une caisse.
                                    </Text>
                                )}
                            </View>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Solde initial"
                                value={formatCurrency(
                                    openRegister.opening_balance,
                                )}
                            />
                            <StatCard
                                label="Entrées"
                                value={formatCurrency(openRegister.total_input)}
                                color={P.emerald}
                            />
                            <StatCard
                                label="Sorties"
                                value={formatCurrency(openRegister.total_output)}
                                color={P.rose}
                            />
                            <StatCard
                                label="Disponible"
                                value={formatCurrency(currentBalance)}
                            />
                        </View>

                        <View style={{ gap: 10 }}>
                            {canAddInput ? (
                                <Button
                                    variant="outline"
                                    onPress={() => setActivePanel('input')}
                                    leftIcon={
                                        <ArrowDownLeft size={16} color="#18181B" />
                                    }
                                >
                                    Ajouter une entrée
                                </Button>
                            ) : null}
                            {canAddOutput ? (
                                <Button
                                    variant="outline"
                                    onPress={() => setActivePanel('output')}
                                    leftIcon={
                                        <ArrowUpRight size={16} color="#18181B" />
                                    }
                                >
                                    Ajouter une sortie
                                </Button>
                            ) : null}
                            {canCloseRegister ? (
                                <Button
                                    variant="outline"
                                    onPress={() => setActivePanel('close')}
                                    leftIcon={<Lock size={16} color="#18181B" />}
                                >
                                    Clôturer la caisse
                                </Button>
                            ) : null}
                        </View>

                        <View style={styles.synthesisCard}>
                            <View style={styles.synthesisHeader}>
                                <View style={styles.synthesisIcon}>
                                    <CircleDollarSign size={18} color="#FFFFFF" />
                                </View>
                                <View>
                                    <Text style={styles.synthesisLabel}>
                                        Synthèse
                                    </Text>
                                    <Text style={styles.synthesisTitle}>
                                        Flux du jour
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.synthesisRow}>
                                <Text style={styles.synthesisRowLabel}>
                                    Ouverture
                                </Text>
                                <Text style={styles.synthesisRowValue}>
                                    {formatCurrency(openRegister.opening_balance)}
                                </Text>
                            </View>
                            <View style={styles.synthesisRow}>
                                <Text style={styles.synthesisRowLabel}>
                                    Entrées
                                </Text>
                                <Text style={styles.synthesisRowValue}>
                                    {formatCurrency(openRegister.total_input)}
                                </Text>
                            </View>
                            <View style={styles.synthesisRow}>
                                <Text style={styles.synthesisRowLabel}>
                                    Sorties
                                </Text>
                                <Text style={styles.synthesisRowValue}>
                                    {formatCurrency(openRegister.total_output)}
                                </Text>
                            </View>
                            <View
                                style={[styles.synthesisRow, styles.synthesisTotal]}
                            >
                                <Text style={styles.synthesisRowLabel}>
                                    Disponible
                                </Text>
                                <Text style={styles.synthesisTotalValue}>
                                    {formatCurrency(currentBalance)}
                                </Text>
                            </View>
                        </View>

                        <Card>
                            <CardContent>
                                <Text style={styles.h2}>Historique du jour</Text>
                                <Text style={styles.muted}>
                                    Les derniers mouvements enregistrés sur la
                                    caisse ouverte.
                                </Text>

                                <View style={{ gap: 10, marginTop: 14 }}>
                                    {movements.length === 0 ? (
                                        <View style={styles.emptyBox}>
                                            <Text style={styles.muted}>
                                                Aucun mouvement enregistré.
                                            </Text>
                                        </View>
                                    ) : (
                                        movements.map((m) => (
                                            <MovementRow
                                                key={`${m.kind}-${m.id}`}
                                                movement={m}
                                                formatCurrency={formatCurrency}
                                            />
                                        ))
                                    )}
                                </View>
                            </CardContent>
                        </Card>
                    </>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* OUVERTURE */}
            {activePanel === 'open' ? (
                <BottomSheet
                    visible
                    onClose={() => setActivePanel(null)}
                    maxHeightRatio={0.7}
                >
                    <BottomSheetHeader>
                        <BottomSheetTitle>Ouvrir la caisse</BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetBody scrollable>
                        {globalErrors.length > 0 ? (
                            <AlertError errors={globalErrors} />
                        ) : null}

                        <FormField label="Solde initial">
                            <Input
                                value={openForm.data.opening_balance}
                                onChangeText={(v) =>
                                    openForm.setData('opening_balance', v)
                                }
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </FormField>

                        {lastClosed?.actual_balance != null ? (
                            <Pressable
                                onPress={() =>
                                    openForm.setData(
                                        'opening_balance',
                                        String(lastClosed.actual_balance),
                                    )
                                }
                            >
                                <Text style={styles.linkText}>
                                    Reprendre le solde précédent (
                                    {formatCurrency(lastClosed.actual_balance)})
                                </Text>
                            </Pressable>
                        ) : null}

                        <FormField label="Notes">
                            <Input
                                value={openForm.data.notes}
                                onChangeText={(v) =>
                                    openForm.setData('notes', v)
                                }
                                placeholder="Notes d’ouverture"
                                multiline
                                numberOfLines={3}
                                style={{ minHeight: 80, textAlignVertical: 'top' }}
                            />
                        </FormField>

                        <View style={styles.actions}>
                            <Button
                                variant="outline"
                                onPress={() => setActivePanel(null)}
                                style={{ flex: 1 }}
                            >
                                Annuler
                            </Button>
                            <Button onPress={submitOpen} style={{ flex: 1 }}>
                                Confirmer
                            </Button>
                        </View>
                    </BottomSheetBody>
                </BottomSheet>
            ) : null}

            {/* ENTRÉE */}
            {activePanel === 'input' ? (
                <BottomSheet
                    visible
                    onClose={() => setActivePanel(null)}
                    maxHeightRatio={0.85}
                >
                    <BottomSheetHeader>
                        <BottomSheetTitle>Nouvelle entrée</BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetBody scrollable>
                        {globalErrors.length > 0 ? (
                            <AlertError errors={globalErrors} />
                        ) : null}

                        <FormField label="Montant">
                            <Input
                                value={inputForm.data.amount}
                                onChangeText={(v) =>
                                    inputForm.setData('amount', v)
                                }
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </FormField>

                        <FormField label="Source">
                            <Select
                                value={inputForm.data.source}
                                onValueChange={(v) =>
                                    inputForm.setData(
                                        'source',
                                        v as CashInputSource,
                                    )
                                }
                                options={[
                                    { label: 'Dépôt', value: 'DEPOSIT' },
                                    {
                                        label: 'Remboursement',
                                        value: 'REFUND',
                                    },
                                    { label: 'Autre', value: 'OTHER' },
                                ]}
                            />
                        </FormField>

                        <FormField label="Référence">
                            <Input
                                value={inputForm.data.reference}
                                onChangeText={(v) =>
                                    inputForm.setData('reference', v)
                                }
                                placeholder="Optionnel"
                            />
                        </FormField>

                        <FormField label="Notes">
                            <Input
                                value={inputForm.data.notes}
                                onChangeText={(v) =>
                                    inputForm.setData('notes', v)
                                }
                                placeholder="Notes"
                                multiline
                                numberOfLines={3}
                                style={{ minHeight: 80, textAlignVertical: 'top' }}
                            />
                        </FormField>

                        <View style={styles.actions}>
                            <Button
                                variant="outline"
                                onPress={() => setActivePanel(null)}
                                style={{ flex: 1 }}
                            >
                                Annuler
                            </Button>
                            <Button onPress={submitInput} style={{ flex: 1 }}>
                                Ajouter
                            </Button>
                        </View>
                    </BottomSheetBody>
                </BottomSheet>
            ) : null}

            {/* SORTIE */}
            {activePanel === 'output' ? (
                <BottomSheet
                    visible
                    onClose={() => setActivePanel(null)}
                    maxHeightRatio={0.9}
                >
                    <BottomSheetHeader>
                        <BottomSheetTitle>Nouvelle sortie</BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetBody scrollable>
                        {globalErrors.length > 0 ? (
                            <AlertError errors={globalErrors} />
                        ) : null}

                        <FormField label="Montant">
                            <Input
                                value={outputForm.data.amount}
                                onChangeText={(v) =>
                                    outputForm.setData('amount', v)
                                }
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </FormField>

                        <FormField label="Motif">
                            <Input
                                value={outputForm.data.reason}
                                onChangeText={(v) =>
                                    outputForm.setData('reason', v)
                                }
                                placeholder="Ex : Achat fournitures"
                            />
                        </FormField>

                        <FormField label="Bénéficiaire">
                            <Input
                                value={outputForm.data.beneficiary}
                                onChangeText={(v) =>
                                    outputForm.setData('beneficiary', v)
                                }
                                placeholder="Optionnel"
                            />
                        </FormField>

                        <FormField label="Référence">
                            <Input
                                value={outputForm.data.reference}
                                onChangeText={(v) =>
                                    outputForm.setData('reference', v)
                                }
                                placeholder="Optionnel"
                            />
                        </FormField>

                        <FormField label="Notes">
                            <Input
                                value={outputForm.data.notes}
                                onChangeText={(v) =>
                                    outputForm.setData('notes', v)
                                }
                                placeholder="Notes"
                                multiline
                                numberOfLines={3}
                                style={{ minHeight: 80, textAlignVertical: 'top' }}
                            />
                        </FormField>

                        <View style={styles.actions}>
                            <Button
                                variant="outline"
                                onPress={() => setActivePanel(null)}
                                style={{ flex: 1 }}
                            >
                                Annuler
                            </Button>
                            <Button onPress={submitOutput} style={{ flex: 1 }}>
                                Ajouter
                            </Button>
                        </View>
                    </BottomSheetBody>
                </BottomSheet>
            ) : null}

            {/* CLÔTURE */}
            {activePanel === 'close' ? (
                <BottomSheet
                    visible
                    onClose={() => setActivePanel(null)}
                    maxHeightRatio={0.7}
                >
                    <BottomSheetHeader>
                        <BottomSheetTitle>Clôturer la caisse</BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetBody scrollable>
                        {globalErrors.length > 0 ? (
                            <AlertError errors={globalErrors} />
                        ) : null}

                        <View style={styles.recapBox}>
                            <Text style={styles.recapLabel}>Solde attendu</Text>
                            <Text style={styles.recapValue}>
                                {formatCurrency(currentBalance)}
                            </Text>
                        </View>

                        <FormField label="Solde réel compté">
                            <Input
                                value={closeForm.data.actual_balance}
                                onChangeText={(v) =>
                                    closeForm.setData('actual_balance', v)
                                }
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </FormField>

                        <FormField label="Notes de clôture">
                            <Input
                                value={closeForm.data.notes}
                                onChangeText={(v) =>
                                    closeForm.setData('notes', v)
                                }
                                placeholder="Optionnel"
                                multiline
                                numberOfLines={3}
                                style={{ minHeight: 80, textAlignVertical: 'top' }}
                            />
                        </FormField>

                        <View style={styles.actions}>
                            <Button
                                variant="outline"
                                onPress={() => setActivePanel(null)}
                                style={{ flex: 1 }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onPress={submitClose}
                                style={{ flex: 1 }}
                            >
                                Clôturer
                            </Button>
                        </View>
                    </BottomSheetBody>
                </BottomSheet>
            ) : null}
        </SafeAreaView>
    );
}

// -------------------------------------------------------------
// Sous-composants
// -------------------------------------------------------------
function StatCard({
    label,
    value,
    color = P.fg,
}: {
    label: string;
    value: string;
    color?: string;
}) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

function MovementRow({
    movement,
    formatCurrency,
}: {
    movement: CashMovement;
    formatCurrency: (n: number) => string;
}) {
    if (!movement || typeof movement !== 'object') return null;

    const isInput = movement.kind === 'input';
    const sourceKey = typeof movement.source === 'string' ? movement.source : '';

    const title = isInput
        ? SOURCE_LABELS[sourceKey] ?? movement.label ?? 'Entrée'
        : movement.reason ?? movement.label ?? 'Sortie';

    const amount = Number(movement.amount ?? 0);
    const amountStr =
        Number.isFinite(amount) && typeof formatCurrency === 'function'
            ? formatCurrency(amount)
            : '0';

    const sign = isInput ? '+' : '-';

    return (
        <View style={styles.movementRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.movementTitle} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={styles.movementMeta} numberOfLines={1}>
                    {movement.reference || movement.notes || 'Sans détails'}
                </Text>
            </View>
            <Text
                style={[
                    styles.movementAmount,
                    { color: isInput ? P.emerald : P.rose },
                ]}
            >
                {`${sign}${amountStr}`}
            </Text>
        </View>
    );
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.bg },
    content: { padding: 16, gap: 16, paddingBottom: 40 },
    header: { gap: 6 },
    h1: { fontSize: 22, fontWeight: '800', color: P.fg },
    h2: { fontSize: 18, fontWeight: '700', color: P.fg, marginBottom: 4 },
    subtitle: { fontSize: 14, color: P.muted },
    muted: { fontSize: 13, color: P.muted },

    emptyHero: { gap: 6, alignItems: 'flex-start' },
    heroIconAmber: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    heroTitle: { fontSize: 22, fontWeight: '800', color: P.fg },
    heroText: { fontSize: 14, color: P.muted, lineHeight: 20, marginTop: 4 },
    lastCloseBox: {
        marginTop: 14,
        padding: 12,
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        alignSelf: 'stretch',
    },
    lastCloseLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: P.emerald,
        letterSpacing: 1.5,
    },
    lastCloseValue: {
        fontSize: 20,
        fontWeight: '800',
        color: P.fg,
        marginTop: 4,
    },
    lastCloseHint: { fontSize: 13, color: P.muted, marginTop: 4 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: {
        width: '48%',
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
        gap: 4,
    },
    statLabel: { fontSize: 12, color: P.muted },
    statValue: { fontSize: 18, fontWeight: '800', marginTop: 6 },

    synthesisCard: {
        backgroundColor: P.dark,
        borderRadius: 16,
        padding: 18,
        gap: 12,
    },
    synthesisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    synthesisIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    synthesisLabel: { fontSize: 12, color: '#CBD5E1' },
    synthesisTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    synthesisRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    synthesisRowLabel: { fontSize: 13, color: '#CBD5E1' },
    synthesisRowValue: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
    synthesisTotal: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.15)',
        paddingTop: 10,
        marginTop: 4,
    },
    synthesisTotalValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },

    movementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: P.border,
    },
    movementTitle: { fontSize: 14, fontWeight: '600', color: P.fg },
    movementMeta: { fontSize: 12, color: P.muted, marginTop: 2 },
    movementAmount: { fontSize: 14, fontWeight: '700' },
    emptyBox: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: P.border,
        alignItems: 'center',
    },

    actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
    linkText: {
        color: P.emerald,
        fontWeight: '600',
        fontSize: 13,
        marginTop: 4,
    },
    recapBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: P.border,
    },
    recapLabel: { fontSize: 12, color: P.muted },
    recapValue: { fontSize: 20, fontWeight: '800', color: P.fg, marginTop: 2 },
});