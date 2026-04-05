import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = {
    ...import.meta.glob('./pages/**/*.tsx'),
    ...import.meta.glob('./pages/**/*.jsx'),
} as Record<string, () => Promise<{ default: never }>>;

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: async (name) => {
            const component =
                pages[`./pages/${name}.tsx`] ?? pages[`./pages/${name}.jsx`];

            if (!component) {
                throw new Error(`Page Inertia introuvable: ${name}`);
            }

            const module = await component();

            return module.default;
        },
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);
