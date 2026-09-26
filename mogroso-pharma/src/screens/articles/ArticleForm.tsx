// src/screens/articles/ArticleForm.tsx
import * as React from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { FormField } from '../../components/forms/FormField';
import AlertError from '../../components/forms/AlertError';
import { useForm } from '../../hooks/useForm';
import { useCategories } from '../../hooks/useCategories';
import { ArticlesRepo } from '../../data/repositories/articles.repo';
import { useOrganizationStore } from '../../store/organization.store';
import type { ArticleRow } from '../../data/types/article';
import type { RootStackParamList } from '../../navigation/types';

const P = {
    bg: '#FAFAFA',
    muted: '#71717A',
    fg: '#18181B',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FormData = {
    name: string;
    category_id: number | null;
    description: string;
    price: string;
    cost_price: string;
    unit_type: 'PACK' | 'UNIT';
    units_per_pack: string;
    unit_price: string;
    initial_quantity: string;
    alert_threshold: string;
    expiration_date: string;
    barcode: string;
    is_active: boolean;
    allow_unit_sale: boolean;
};

export type ArticleFormProps = {
    mode: 'create' | 'edit';
    article?: ArticleRow | null;
};

function normalizeDate(v?: string | null): string {
    if (!v) return '';
    return String(v).slice(0, 10);
}

export default function ArticleForm({ mode, article }: ArticleFormProps) {
    const navigation = useNavigation<Nav>();
    const isEditing = mode === 'edit';
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);

    const { data: categories } = useCategories();
    const [globalErrors, setGlobalErrors] = React.useState<string[]>([]);

    const form = useForm<FormData>({
        name: article?.name ?? '',
        category_id: article?.category_id ?? null,
        description: article?.description ?? '',
        price: String(article?.price ?? ''),
        cost_price: String(article?.cost_price ?? ''),
        unit_type: article?.unit_type ?? 'UNIT',
        units_per_pack: String(article?.units_per_pack ?? ''),
        unit_price: String(article?.unit_price ?? ''),
        initial_quantity: String(article?.initial_quantity ?? '0'),
        alert_threshold: String(article?.alert_threshold ?? '10'),
        expiration_date: normalizeDate(article?.expiration_date),
        barcode: article?.barcode ?? '',
        is_active: article?.is_active === 0 ? false : true,
        allow_unit_sale: article?.allow_unit_sale === 1,
    });

    const validate = (): boolean => {
        const e: typeof form.errors = {};
        if (!form.data.name.trim()) e.name = 'Le nom est obligatoire.';
        if (!form.data.price || Number(form.data.price) <= 0)
            e.price = 'Le prix doit être supérieur à 0.';
        if (!isEditing && Number(form.data.initial_quantity) < 0)
            e.initial_quantity = 'Le stock initial doit être positif.';
        if (form.data.unit_type === 'PACK') {
            const upp = Number(form.data.units_per_pack);
            if (!upp || upp <= 0)
                e.units_per_pack = 'Nombre d’unités par pack requis.';
        }
        form.setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        setGlobalErrors([]);
        if (!validate()) return;

        form.setProcessing(true);
        try {
            const common = {
                name: form.data.name.trim(),
                category_id: form.data.category_id,
                description: form.data.description.trim() || null,
                price: Number(form.data.price),
                cost_price: form.data.cost_price
                    ? Number(form.data.cost_price)
                    : null,
                unit_type: form.data.unit_type,
                units_per_pack:
                    form.data.unit_type === 'PACK'
                        ? Number(form.data.units_per_pack) || null
                        : null,
                unit_price:
                    form.data.unit_type === 'PACK'
                        ? Number(form.data.unit_price) || null
                        : null,
                alert_threshold: Number(form.data.alert_threshold) || 0,
                expiration_date: form.data.expiration_date || null,
                barcode: form.data.barcode.trim() || null,
                is_active: form.data.is_active,
                allow_unit_sale:
                    form.data.unit_type === 'PACK'
                        ? form.data.allow_unit_sale
                        : false,
            };

            if (isEditing && article) {
                await ArticlesRepo.update(article.id, common);
            } else {
                await ArticlesRepo.create({
                    ...common,
                    organization_id: orgId,
                    initial_quantity: Number(form.data.initial_quantity) || 0,
                });
            }

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

            <FormField label="Nom" error={form.errors.name}>
                <Input
                    value={form.data.name}
                    onChangeText={(v) => form.setData('name', v)}
                    placeholder="Ex : Coca-Cola 1.5L"
                    invalid={!!form.errors.name}
                />
            </FormField>

            <FormField label="Catégorie" error={form.errors.category_id}>
                <Select
                    value={form.data.category_id}
                    onValueChange={(v) => form.setData('category_id', v)}
                    placeholder="Sans catégorie"
                    title="Catégorie"
                    options={[
                        { label: 'Sans catégorie', value: null as any },
                        ...categories.map((c) => ({
                            label: c.name,
                            value: c.id,
                        })),
                    ]}
                />
            </FormField>

            <FormField label="Prix de vente" error={form.errors.price}>
                <Input
                    value={form.data.price}
                    onChangeText={(v) => form.setData('price', v)}
                    keyboardType="numeric"
                    placeholder="0"
                    invalid={!!form.errors.price}
                />
            </FormField>

            <FormField label="Prix d’achat" error={form.errors.cost_price}>
                <Input
                    value={form.data.cost_price}
                    onChangeText={(v) => form.setData('cost_price', v)}
                    keyboardType="numeric"
                    placeholder="Optionnel"
                />
            </FormField>

            <FormField label="Type d’unité" error={form.errors.unit_type}>
                <Select
                    value={form.data.unit_type}
                    onValueChange={(v) => form.setData('unit_type', v)}
                    options={[
                        { label: 'Unité', value: 'UNIT' },
                        { label: 'Pack', value: 'PACK' },
                    ]}
                />
            </FormField>

            {form.data.unit_type === 'PACK' ? (
                <>
                    <FormField
                        label="Unités par pack"
                        error={form.errors.units_per_pack}
                    >
                        <Input
                            value={form.data.units_per_pack}
                            onChangeText={(v) => form.setData('units_per_pack', v)}
                            keyboardType="numeric"
                            placeholder="Ex : 12"
                            invalid={!!form.errors.units_per_pack}
                        />
                    </FormField>

                    <FormField label="Prix à l’unité" error={form.errors.unit_price}>
                        <Input
                            value={form.data.unit_price}
                            onChangeText={(v) => form.setData('unit_price', v)}
                            keyboardType="numeric"
                            placeholder="Prix unitaire si vendu à l’unité"
                        />
                    </FormField>
                </>
            ) : null}

            <FormField label="Code-barres" error={form.errors.barcode}>
                <Input
                    value={form.data.barcode}
                    onChangeText={(v) => form.setData('barcode', v)}
                    placeholder="Scanner ou saisir"
                    autoCapitalize="none"
                />
            </FormField>

            {!isEditing ? (
                <FormField
                    label="Stock initial"
                    error={form.errors.initial_quantity}
                >
                    <Input
                        value={form.data.initial_quantity}
                        onChangeText={(v) => form.setData('initial_quantity', v)}
                        keyboardType="numeric"
                        placeholder="0"
                        invalid={!!form.errors.initial_quantity}
                    />
                </FormField>
            ) : null}

            <FormField
                label="Seuil d’alerte"
                error={form.errors.alert_threshold}
            >
                <Input
                    value={form.data.alert_threshold}
                    onChangeText={(v) => form.setData('alert_threshold', v)}
                    keyboardType="numeric"
                    placeholder="10"
                />
            </FormField>

            <FormField
                label="Date d’expiration"
                error={form.errors.expiration_date}
            >
                <Input
                    value={form.data.expiration_date}
                    onChangeText={(v) => form.setData('expiration_date', v)}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                />
            </FormField>

            <FormField label="Description" error={form.errors.description}>
                <Input
                    value={form.data.description}
                    onChangeText={(v) => form.setData('description', v)}
                    placeholder="Description du produit…"
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
            </FormField>

            <View style={styles.row}>
                <Checkbox
                    checked={form.data.is_active}
                    onCheckedChange={(v) => form.setData('is_active', v)}
                    label="Article actif"
                    style={{ flex: 1 }}
                />
            </View>

            {form.data.unit_type === 'PACK' ? (
                <View style={styles.row}>
                    <Checkbox
                        checked={form.data.allow_unit_sale}
                        onCheckedChange={(v) => form.setData('allow_unit_sale', v)}
                        label="Vente à l’unité autorisée"
                        style={{ flex: 1 }}
                    />
                </View>
            ) : null}

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
                    {isEditing ? 'Mettre à jour' : 'Créer l’article'}
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
});