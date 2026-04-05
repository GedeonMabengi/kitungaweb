import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Connexion a votre espace"
            description="Retrouve votre cockpit commercial avec une connexion simple, rapide et securisee."
        >
            <Head title="Connexion" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {status ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {status}
                    </div>
                ) : null}

                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="email"
                            className="text-sm font-semibold text-[#3f392f]"
                        >
                            Adresse email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="nom@entreprise.com"
                            className="h-12 rounded-2xl border-[#e8e0d3] bg-[#fcfaf7] px-4 shadow-none"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label
                                htmlFor="password"
                                className="text-sm font-semibold text-[#3f392f]"
                            >
                                Mot de passe
                            </Label>
                            {canResetPassword ? (
                                <TextLink
                                    href="/forgot-password"
                                    className="ml-auto text-sm text-[#9a5d18]"
                                    tabIndex={5}
                                >
                                    Mot de passe oublie ?
                                </TextLink>
                            ) : null}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Votre mot de passe"
                            className="h-12 rounded-2xl border-[#e8e0d3] bg-[#fcfaf7] px-4 shadow-none"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3 rounded-2xl border border-[#eee5d8] bg-[#fcfaf7] px-4 py-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) =>
                                setData('remember', checked === true)
                            }
                            tabIndex={3}
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm font-medium text-[#5d574e]"
                        >
                            Garder ma session active
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-12 w-full rounded-2xl bg-[#1b1b18] text-white hover:bg-[#2a2924]"
                        tabIndex={4}
                        disabled={processing}
                        data-test="login-button"
                    >
                        {processing ? <Spinner /> : null}
                        Se connecter
                    </Button>
                </div>

                {canRegister ? (
                    <div className="text-center text-sm text-[#6d665c]">
                        Pas encore de compte ?{' '}
                        <TextLink
                            href="/register"
                            tabIndex={5}
                            className="font-semibold text-[#9a5d18]"
                        >
                            Creer un compte
                        </TextLink>
                    </div>
                ) : null}
            </form>
        </AuthLayout>
    );
}
