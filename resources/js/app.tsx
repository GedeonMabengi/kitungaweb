import { createInertiaApp } from '@inertiajs/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = {
    ...import.meta.glob('./pages/**/*.tsx'),
    ...import.meta.glob('./pages/**/*.jsx'),
} as Record<string, () => Promise<{ default: never }>>;

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page =
            pages[`./pages/${name}.tsx`] ?? pages[`./pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Page Inertia introuvable: ${name}`);
        }

        const module = await page();

        return module.default;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#0f172a',
    },
});

initializeTheme();
