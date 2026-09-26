// src/screens/stock/movements/StockMovementCreateScreen.tsx
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FormField } from '../../../components/forms/FormField';
import AlertError from '../../../components/forms/AlertError';
import { useForm } from '../../../hooks/useForm';
import { useArticles } from '../../../hooks/useArticles';
import { StockMovementsRepo } from '../../../data/repositories/stockMovements.repo';
import { useOrganizationStore } from '../../../store/organization.store';
import { useSessionStore } from '../../../store/session.store';
import type {
    StockMovementType,
    StockQuantityType,
} from '../../../data/types/stock';
import type { RootStackParamList } from '../../../navigation/types';

const P = {
    bg: '#FAFAFA',
    muted: '#71717A',
    border: '#E4E4E7',
    card: '#FFFFFF',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FormData = {
    article_id: number | null;
    movement_type: StockMovementType;
    quantity: string;
    quantity_type: StockQuantityType;
    reason: string;
    reference: string;
    notes: string;
};

export default function StockMovementCreateScreen() {
    const navigation = useNavigation<Nav>();
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const userId = useSessionStore((s) => s.user?.id ?? 1);

    const { data: articles } = useArticles({ per_page: 500, page: 1 });
    const [globalErrors, setGlobalErrors] = React.useState<string[]>([]);

    const form = useForm<FormData>({
        article_id: null,
        movement_type: 'IN',
        quantity: '1',
        quantity_type: 'UNIT',
        reason: '',
        reference: '',
        notes: '',
    });

    const selectedArticle = React.useMemo(
        () => articles.find((a) => a.id === form.data.article_id) ?? null,
        [articles, form.data.article_id],
    );

    const validate = (): boolean => {
        const e: typeof form.errors = {};
        if (!form.data.article_id) e.article_id = 'Choisis un article.';
        const q = Number(form.data.quantity);
        if (!q || q <= 0) e.quantity = 'La quantité doit être supérieure à 0.';
        if (!form.data.reason.trim()) e.reason = 'Le motif est obligatoire.';
        if (
            form.data.quantity_type === 'PACK' &&
            (!selectedArticle || !selectedArticle.units_per_pack)
        ) {
            e.quantity_type = 'Cet article n’est pas vendu en pack.';
        }
        form.setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        setGlobalErrors([]);
        if (!validate()) return;

        form.setProcessing(true);
        try {
            await StockMovementsRepo.create({
                organization_id: orgId,
                article_id: form.data.article_id!,
                user_id: userId,
                movement_type: form.data.movement_type,
                quantity: Number(form.data.quantity),
                quantity_type: form.data.quantity_type,
                reason: form.data.reason.trim(),
                reference: form.data.reference.trim() || null,
                notes: form.data.notes.trim() || null,
            });
            navigation.goBack();
        } catch (e) {
            setGlobalErrors([
                e instanceof Error ? e.message : 'Erreur lors de l’enregistrement.',
            ]);
        } finally {
            form.setProcessing(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            {globalErrors.length > 0 ? (
                <AlertError errors={globalErrors} title="Erreur" />
            ) : null}

            {/* Résumé article sélectionné */}
            {selectedArticle ? (
                <View style={styles.summary}>
                    <Text style={styles.summaryLabel}>Stock actuel</Text>
                    <Text style={styles.summaryValue}>
                        {selectedArticle.current_stock} unités
                    </Text>
                    {selectedArticle.units_per_pack ? (
                        <Text style={styles.summaryHint}>
                            1 pack = {selectedArticle.units_per_pack} unités
                        </Text>
                    ) : null}
                </View>
            ) : null}

            <FormField label="Article" error={form.errors.article_id}>
                <Select
                    value={form.data.article_id}
                    onValueChange={(v) => form.setData('article_id', v)}
                    placeholder="Choisir un article"
                    title="Article"
                    options={articles.map((a) => ({
                        label: `${a.name} — stock ${a.current_stock}`,
                        value: a.id,
                    }))}
                />
            </FormField>

            <FormField label="Type de mouvement">
                <Select
                    value={form.data.movement_type}
                    onValueChange={(v) =>
                        form.setData('movement_type', v as StockMovementType)
                    }
                    options={[
                        { label: 'Entrée', value: 'IN' },
                        { label: 'Sortie', value: 'OUT' },
                        { label: 'Ajustement', value: 'ADJUSTMENT' },
                    ]}
                />
            </FormField>

            <FormField label="Quantité" error={form.errors.quantity}>
                <Input
                    value={form.data.quantity}
                    onChangeText={(v) => form.setData('quantity', v)}
                    keyboardType="numeric"
                    placeholder="1"
                    invalid={!!form.errors.quantity}
                />
            </FormField>

            <FormField label="Unité" error={form.errors.quantity_type}>
                <Select
                    value={form.data.quantity_type}
                    onValueChange={(v) =>
                        form.setData('quantity_type', v as StockQuantityType)
                    }
                    options={[
                        { label: 'Unité', value: 'UNIT' },
                        {
                            label: selectedArticle?.units_per_pack
                                ? `Pack (${selectedArticle.units_per_pack} unités)`
                                : 'Pack (indisponible)',
                            value: 'PACK',
                            disabled: !selectedArticle?.units_per_pack,
                        },
                    ]}
                />
            </FormField>

            <FormField label="Motif" error={form.errors.reason}>
                <Input
                    value={form.data.reason}
                    onChangeText={(v) => form.setData('reason', v)}
                    placeholder="Ex : Réception fournisseur, Casse…"
                    invalid={!!form.errors.reason}
                />
            </FormField>

            <FormField label="Référence">
                <Input
                    value={form.data.reference}
                    onChangeText={(v) => form.setData('reference', v)}
                    placeholder="N° facture, bon de livraison (optionnel)"
                    autoCapitalize="none"
                />
            </FormField>

            <FormField label="Notes">
                <Input
                    value={form.data.notes}
                    onChangeText={(v) => form.setData('notes', v)}
                    placeholder="Notes complémentaires (optionnel)"
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
            </FormField>

            <View style={styles.actions}>
                <Button
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={{ flex: 1 }}
                >
                    Annuler
                </Button>
                <Button
                    onPress={submit}
                    loading={form.processing}
                    style={{ flex: 1 }}
                >
                    Enregistrer
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 40,
        gap: 16,
        backgroundColor: P.bg,
    },
    summary: {
        backgroundColor: P.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 14,
        gap: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: P.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    summaryValue: { fontSize: 22, fontWeight: '800', color: '#18181B' },
    summaryHint: { fontSize: 12, color: P.muted },
    actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});