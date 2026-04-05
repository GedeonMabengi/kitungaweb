import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';
import { logout } from '@/routes';

import {
    Home as HomeIcon,
    Box as CubeIcon,
    ShoppingCart as ShoppingCartIcon,
    Banknote as BanknotesIcon,
    ChartBar as ChartBarIcon,
    Users as UsersIcon,
    Menu as Bars3Icon,
    X as XMarkIcon,
    LogOut as ArrowRightOnRectangleIcon,
} from 'lucide-react';

const icons = {
    home: HomeIcon,
    box: CubeIcon,
    'shopping-cart': ShoppingCartIcon,
    banknote: BanknotesIcon,
    'chart-bar': ChartBarIcon,
    users: UsersIcon,
};

export default function AuthenticatedLayout({ children, header }) {
    const page = usePage();
    const { auth, navigation = [] } = page.props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = new URL(page.url ?? '/', 'http://localhost').pathname;

    const isCurrentItem = (href) => {
        const normalizedHref = toUrl(href);

        if (!normalizedHref) {
            return false;
        }

        const itemPath = normalizedHref.startsWith('http')
            ? new URL(normalizedHref).pathname
            : normalizedHref;

        return (
            currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div
                className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}
            >
                <div
                    className="bg-opacity-75 fixed inset-0 bg-gray-600"
                    onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 flex h-full w-64 flex-col overflow-hidden bg-indigo-700">
                    <div className="flex h-16 items-center justify-between px-4">
                        <span className="text-xl font-bold text-white">
                            KITUNGA
                        </span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-4">
                        {navigation.map((item) => {
                            const Icon = icons[item.icon] ?? HomeIcon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                                >
                                    <Icon className="mr-3 h-6 w-6" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex flex-shrink-0 border-t border-indigo-800 p-4">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                    {auth.user.name}
                                </p>
                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    className="mt-1 flex items-center text-xs font-medium text-indigo-200 hover:text-white"
                                >
                                    <ArrowRightOnRectangleIcon className="mr-1 h-4 w-4" />
                                    Se deconnecter
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-grow flex-col overflow-hidden bg-indigo-700 pt-5">
                    <div className="flex flex-shrink-0 items-center px-4">
                        <span className="text-2xl font-bold text-white">
                            KITUNGA
                        </span>
                    </div>
                    <nav className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto px-2">
                        {navigation.map((item) => {
                            const Icon = icons[item.icon] ?? HomeIcon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium text-white hover:bg-indigo-600 ${
                                        isCurrentItem(item.href)
                                            ? 'bg-indigo-800'
                                            : ''
                                    }`}
                                >
                                    <Icon className="mr-3 h-6 w-6" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex flex-shrink-0 border-t border-indigo-800 p-4">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                    {auth.user.name}
                                </p>
                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    className="flex items-center text-xs font-medium text-indigo-200 hover:text-white"
                                >
                                    <ArrowRightOnRectangleIcon className="mr-1 h-4 w-4" />
                                    Deconnexion
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col lg:pl-64">
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
                    <button
                        type="button"
                        className="px-4 text-gray-500 focus:outline-none lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1 items-center">
                            <span className="text-xl font-bold text-indigo-600">
                                KITUNGA
                            </span>
                        </div>
                    </div>
                </div>

                <main className="flex-1">
                    {header && (
                        <header className="bg-white shadow">
                            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}
                    <div className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
