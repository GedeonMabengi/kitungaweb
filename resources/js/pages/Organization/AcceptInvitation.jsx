import { Head, Link, useForm } from '@inertiajs/react';

export default function AcceptInvitation({ invitation }) {
    const form = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_35%),linear-gradient(180deg,#f8f4ee_0%,#fffdf8_100%)] px-4 py-10">
            <Head title="Rejoindre une organisation" />

            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[2rem] border border-[#eadfce] bg-[#fffaf2] p-8 shadow-[0_30px_80px_rgba(45,35,20,0.08)]">
                    <span className="inline-flex rounded-full border border-[#ead7b5] bg-[#fff1d8] px-3 py-1 text-xs font-semibold tracking-[0.25em] text-[#9a5d18] uppercase">
                        Invitation
                    </span>
                    <h1 className="mt-4 text-4xl font-black tracking-tight text-[#201a12]">
                        Rejoignez {invitation.organization.name}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#5f574b]">
                        Votre acces a deja ete prepare. Finalisez simplement
                        votre compte pour retrouver votre role, vos permissions
                        et votre espace de travail.
                    </p>

                    <dl className="mt-10 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-[#eadfce] bg-white/80 p-5">
                            <dt className="text-sm text-[#7d7568]">
                                Organisation
                            </dt>
                            <dd className="mt-2 text-lg font-bold text-[#201a12]">
                                {invitation.organization.name}
                            </dd>
                        </div>
                        <div className="rounded-3xl border border-[#eadfce] bg-white/80 p-5">
                            <dt className="text-sm text-[#7d7568]">Role</dt>
                            <dd className="mt-2 text-lg font-bold text-[#201a12]">
                                {invitation.role}
                            </dd>
                        </div>
                        <div className="rounded-3xl border border-[#eadfce] bg-white/80 p-5 sm:col-span-2">
                            <dt className="text-sm text-[#7d7568]">
                                Adresse invitee
                            </dt>
                            <dd className="mt-2 text-lg font-bold text-[#201a12]">
                                {invitation.email}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-[2rem] border border-[#eadfce] bg-white p-8 shadow-[0_24px_60px_rgba(45,35,20,0.08)]">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-[#201a12]">
                            Creer le compte collaborateur
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#625a50]">
                            Le compte sera relie a cette organisation des la
                            validation.
                        </p>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(
                                `/organization/invitations/${invitation.token}/accept`,
                            );
                        }}
                        className="mt-8 space-y-5"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#3f392f]">
                                Nom complet
                            </label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="h-12 w-full rounded-2xl border border-[#e8e0d3] bg-[#fcfaf7] px-4 text-sm text-[#201a12] transition outline-none focus:border-[#d7b27a]"
                                placeholder="Nom du collaborateur"
                            />
                            {form.errors.name ? (
                                <p className="text-sm text-rose-600">
                                    {form.errors.name}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#3f392f]">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                className="h-12 w-full rounded-2xl border border-[#e8e0d3] bg-[#fcfaf7] px-4 text-sm text-[#201a12] transition outline-none focus:border-[#d7b27a]"
                                placeholder="Mot de passe"
                            />
                            {form.errors.password ? (
                                <p className="text-sm text-rose-600">
                                    {form.errors.password}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#3f392f]">
                                Confirmation du mot de passe
                            </label>
                            <input
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                className="h-12 w-full rounded-2xl border border-[#e8e0d3] bg-[#fcfaf7] px-4 text-sm text-[#201a12] transition outline-none focus:border-[#d7b27a]"
                                placeholder="Confirmez le mot de passe"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#1b1b18] text-sm font-semibold text-white transition hover:bg-[#2b2924] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Finaliser et acceder a l&apos;application
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-[#6d665c]">
                        Vous avez deja un compte ?{' '}
                        <Link
                            href="/login"
                            className="font-semibold text-[#9a5d18]"
                        >
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
