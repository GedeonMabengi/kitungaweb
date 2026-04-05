import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        organization_name: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/register');
    };

    return (
        <AuthLayout
            title="Creation de votre organisation"
            description="Ouvre ton espace SaaS, cree le compte administrateur proprietaire et lance ton essai."
        >
            <Head title="Inscription" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="organization_name"
                            className="text-sm font-semibold text-[#3f392f]"
                        >
                            Nom de l&apos;organisation
                        </Label>
                        <Input
                            id="organization_name"
                            type="text"
                            value={data.organization_name}
                            onChange={(event) =>
                                setData('organization_name', event.target.value)
                            }
                            placeholder="Entreprise X"
                            className="h-12 rounded-2xl border-[#e8e0d3] bg-[#fcfaf7] px-4 shadow-none"
                            required
                        />
                        <InputError message={errors.organization_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="name"
                            className="text-sm font-semibold text-[#3f392f]"
                        >
                            Nom complet du proprietaire
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder="Votre nom"
                            className="h-12 rounded-2xl border-[#e8e0d3] bg-[#fcfaf7] px-4 shadow-none"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="email"
                            className="text-sm font-semibold text-[#3f392f]"
                        >
                            Adresse email de facturation
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            placeholder="admin@entreprise.com"
                            className="h-12 rounded-2xl border-[#e8e0d3] bg-[#fcfaf7] px-4 shadow-none"
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="password"
                            className="text-sm font-semibold text-[#3f392f]"
                        >
                            Mot de passe
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            placeholder="Choisissez un mot de passe"
                            className="h-12 rounded-2xl border-[#e8e0d3] bg-[#fcfaf7] px-4 shadow-none"
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="password_confirmation"
                            className="text-sm font-semibold text-[#3f392f]"
                        >
                            Confirmation
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) =>
                                setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            placeholder="Confirmez le mot de passe"
                            className="h-12 rounded-2xl border-[#e8e0d3] bg-[#fcfaf7] px-4 shadow-none"
                            required
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="h-12 w-full rounded-2xl bg-[#1b1b18] text-white hover:bg-[#2a2924]"
                        disabled={processing}
                    >
                        {processing ? <Spinner /> : null}
                        Creer mon organisation
                    </Button>
                </div>

                <div className="text-center text-sm text-[#6d665c]">
                    Vous avez deja un compte ?{' '}
                    <TextLink
                        href="/login"
                        className="font-semibold text-[#9a5d18]"
                    >
                        Se connecter
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
