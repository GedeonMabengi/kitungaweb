// src/data/seedSession.ts
import { useSessionStore } from '../store/session.store';

export function seedSession() {
    useSessionStore.getState().setUser({
        id: 1,
        name: 'Demo Admin',
        email: 'admin@kitunga.local',
        roles: [{ name: 'admin' }],
        permissions: [
            'articles.view', 'articles.create', 'articles.update', 'articles.delete',
            'sales.view', 'sales.create',
            'cash.view', 'cash.manage',
            'stock.view', 'stock.manage',
            'reports.view',
            'users.view', 'users.create', 'users.edit', 'users.manage',

        ],
    });
}