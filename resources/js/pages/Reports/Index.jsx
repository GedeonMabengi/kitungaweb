import { Head, Link } from '@inertiajs/react';
import { BarChart3, Boxes, WalletCards } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const iconByKey = {
    sales: BarChart3,
    stock: Boxes,
    cash: WalletCards,
};

export default function ReportsIndex({ availableReports = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="app-badge">Rapports</span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Centre de pilotage et d&apos;analyse
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Accede uniquement aux rapports autorises pour ton
                            role, avec une separation claire entre ventes, stock
                            et caisse.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-lg">
                        <p className="text-xs text-slate-300">Acces actifs</p>
                        <p className="mt-1 text-xl font-extrabold">
                            {availableReports.length}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Rapports" />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {availableReports.map((report) => {
                    const Icon = iconByKey[report.key] ?? BarChart3;

                    return (
                        <Link
                            key={report.key}
                            href={report.href}
                            className="app-card transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-lg font-bold text-slate-950">
                                        {report.title}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {report.description}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-6 text-sm font-semibold text-slate-900">
                                Ouvrir le rapport
                            </div>
                        </Link>
                    );
                })}
            </div>
        </AuthenticatedLayout>
    );
}
