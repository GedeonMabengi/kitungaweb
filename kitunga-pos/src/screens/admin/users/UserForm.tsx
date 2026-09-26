// src/screens/admin/users/UserForm.tsx
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { FormField } from '../../../components/forms/FormField';
import AlertError from '../../../components/forms/AlertError';
import { useForm } from '../../../hooks/useForm';
import { UsersRepo } from '../../../data/repositories/users.repo';
import { useOrganizationStore } from '../../../store/organization.store';
import {
    AVAILABLE_ROLES,
    type UserWithRoles,
} from '../../../data/types/user';
import type { RootStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role: string;
    is_active: boolean;
};

export default function UserForm({
    mode,
    user,
}: {
    mode: 'create' | 'edit';
    user?: UserWithRoles | null;
}) {
    const navigation = useNavigation<Nav>();
    const isEditing = mode === 'edit';
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);

    const [globalErrors, setGlobalErrors] = React.useState<string[]>([]);

    const form = useForm<FormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        password: '',
        password_confirmation: '',
        role: user?.role_names[0] ?? '',
        is_active: user?.is_active === 0 ? false : true,
    });

    const validate = (): boolean => {
        const e: typeof form.errors = {};
        if (!form.data.name.trim()) e.name = 'Le nom est obligatoire.';
        if (!form.data.email.trim()) e.email = 'L’email est obligatoire.';
        else if (!/^\S+@\S+\.\S+$/.test(form.data.email))
            e.email = 'Format d’email invalide.';
        if (!isEditing && !form.data.password)
            e.password = 'Le mot de passe est obligatoire.';
        if (form.data.password && form.data.password.length < 6)
            e.password = 'Le mot de passe doit faire au moins 6 caractères.';
        if (
            form.data.password &&
            form.data.password !== form.data.password_confirmation
        ) {
            e.password_confirmation = 'Les mots de passe ne correspondent pas.';
        }
        if (!form.data.role) e.role = 'Le rôle est obligatoire.';
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
                email: form.data.email.trim(),
                phone: form.data.phone.trim() || null,
                role: form.data.role,
                is_active: form.data.is_active,
            };

            if (isEditing && user) {
                await UsersRepo.update(user.id, {
                    ...common,
                    password: form.data.password || null,
                });
            } else {
                await UsersRepo.create({
                    ...common,
                    organization_id: orgId,
                    password: form.data.password,
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
                    placeholder="Nom complet"
                    invalid={!!form.errors.name}
                />
            </FormField>

            <FormField label="Email" error={form.errors.email}>
                <Input
                    value={form.data.email}
                    onChangeText={(v) => form.setData('email', v)}
                    placeholder="utilisateur@exemple.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    invalid={!!form.errors.email}
                />
            </FormField>

            <FormField label="Téléphone" error={form.errors.phone}>
                <Input
                    value={form.data.phone}
                    onChangeText={(v) => form.setData('phone', v)}
                    placeholder="+243…"
                    keyboardType="phone-pad"
                />
            </FormField>

            <FormField label="Rôle" error={form.errors.role}>
                <Select
                    value={form.data.role}
                    onValueChange={(v) => form.setData('role', v)}
                    placeholder="Choisir un rôle"
                    title="Rôle"
                    options={AVAILABLE_ROLES.map((r) => ({
                        label: r.label,
                        value: r.name,
                    }))}
                />
            </FormField>

            <FormField
                label={isEditing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                error={form.errors.password}
            >
                <Input
                    value={form.data.password}
                    onChangeText={(v) => form.setData('password', v)}
                    placeholder={isEditing ? 'Laisser vide pour ne pas changer' : '••••••'}
                    secureTextEntry
                    autoCapitalize="none"
                    invalid={!!form.errors.password}
                />
            </FormField>

            <FormField
                label="Confirmation mot de passe"
                error={form.errors.password_confirmation}
            >
                <Input
                    value={form.data.password_confirmation}
                    onChangeText={(v) => form.setData('password_confirmation', v)}
                    placeholder="••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    invalid={!!form.errors.password_confirmation}
                />
            </FormField>

            <View style={styles.row}>
                <Checkbox
                    checked={form.data.is_active}
                    onCheckedChange={(v) => form.setData('is_active', v)}
                    label="Utilisateur actif"
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
                    {isEditing ? 'Mettre à jour' : 'Créer l’utilisateur'}
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