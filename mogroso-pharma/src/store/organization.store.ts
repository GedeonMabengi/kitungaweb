// src/store/organization.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Organization = {
    id: number | null;
    name: string | null;
    currency: string | null;
    base_currency: string | null;
    exchange_rate: number | null;
};

type OrganizationState = {
    organization: Organization | null;
    setOrganization: (org: Organization | null) => void;
    patchOrganization: (patch: Partial<Organization>) => void;
};

const DEFAULT_ORG: Organization = {
    id: null,
    name: null,
    currency: 'CDF',
    base_currency: 'CDF',
    exchange_rate: 1,
};

export const useOrganizationStore = create<OrganizationState>()(
    persist(
        (set, get) => ({
            organization: DEFAULT_ORG,
            setOrganization: (org) => set({ organization: org ?? DEFAULT_ORG }),
            patchOrganization: (patch) =>
                set({
                    organization: {
                        ...(get().organization ?? DEFAULT_ORG),
                        ...patch,
                    },
                }),
        }),
        {
            name: 'organization-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);