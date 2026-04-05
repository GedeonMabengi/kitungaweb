import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex items-center justify-between gap-3">
            <div className="flex flex-1 justify-between gap-3 sm:hidden">
                {links[0].url ? (
                    <Link href={links[0].url} className="app-button-secondary">
                        Precedent
                    </Link>
                ) : (
                    <span className="app-button-secondary cursor-not-allowed opacity-50">
                        Precedent
                    </span>
                )}

                {links[links.length - 1].url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="app-button-secondary"
                    >
                        Suivant
                    </Link>
                ) : (
                    <span className="app-button-secondary cursor-not-allowed opacity-50">
                        Suivant
                    </span>
                )}
            </div>

            <div className="hidden flex-1 items-center justify-center sm:flex">
                <div className="app-shell-bg inline-flex gap-2 px-2 py-2">
                    <nav className="inline-flex items-center gap-2">
                        {links.map((link, index) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={index}
                                        className="inline-flex min-w-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-slate-300"
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`inline-flex min-w-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                        link.active
                                            ? 'bg-slate-950 text-white shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </nav>
    );
}
