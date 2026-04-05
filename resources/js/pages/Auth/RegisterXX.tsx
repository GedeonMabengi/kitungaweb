// resources/js/Pages/Auth/Register.tsx
import { Head, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                // Redirige ou affiche un message de succès
            },
        });
    };

    return (
        <div>
            <Head title="Inscription" />
            <h1>Inscription</h1>
            <form onSubmit={submit}>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Nom"
                />
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Email"
                />
                <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Mot de passe"
                />
                <input
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    placeholder="Confirmer le mot de passe"
                />
                <button type="submit" disabled={processing}>
                    S'inscrire
                </button>
            </form>
        </div>
    );
}
