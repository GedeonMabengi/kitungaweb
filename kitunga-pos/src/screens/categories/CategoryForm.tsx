// src/screens/categories/CategoryForm.tsx
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { FormField } from '../../components/forms/FormField';
import AlertError from '../../components/forms/AlertError';
import { useForm } from '../../hooks/useForm';
import { CategoriesRepo } from '../../data/repositories/categories.repo';
import { useOrganizationStore } from '../../store/organization.store';
import type { Category } from '../../data/types/category';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FormData = {
    name: string;
    description: string;
    is_active: boolean;
};

export default function CategoryForm({
    mode,
    category,
}: {
    mode: 'create' | 'edit';
    category?: Category | null;
}) {
    const navigation = useNavigation<Nav>();
    const isEditing = mode === 'edit';
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);

    const [globalErrors, setGlobalErrors] = React.useState<string[]>([]);

    const form = useForm<FormData>({
        name: category?.name ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active === 0 ? false : true,
    });

    const validate = (): boolean => {
        const e: typeof form.errors = {};
        if (!form.data.name.trim()) e.name = 'Le nom est obligatoire.';
        form.setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        setGlobalErrors([]);
        if (!validate()) return;

        form.setProcessing(true);
        try {
            const payload = {
                name: form.data.name.trim(),
                description: form.data.description.trim() || null,
                is_active: form.data.is_active,
            };

            if (isEditing && category) {
                await CategoriesRepo.update(category.id, payload);
            } else {
                await CategoriesRepo.create({
                    ...payload,
                    organization_id: orgId,
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
                    placeholder="Ex : Boissons"
                    invalid={!!form.errors.name}
                />
            </FormField>

            <FormField label="Description" error={form.errors.description}>
                <Input
                    value={form.data.description}
                    onChangeText={(v) => form.setData('description', v)}
                    placeholder="Description de la catégorie…"
                    multiline
                    numberOfLines={5}
                    style={{ minHeight: 120, textAlignVertical: 'top' }}
                />
            </FormField>

            <View style={styles.row}>
                <Checkbox
                    checked={form.data.is_active}
                    onCheckedChange={(v) => form.setData('is_active', v)}
                    label="Catégorie active"
                />
            </View>

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
                    {isEditing ? 'Mettre à jour' : 'Créer la catégorie'}
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
        backgroundColor: '#FAFAFA',
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});