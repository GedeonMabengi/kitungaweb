// src/navigation/types.ts

import type { NavigatorScreenParams } from '@react-navigation/native';

// -------------------------------------------------------------
// Paramètres par écran (undefined = pas de params)
// -------------------------------------------------------------
export type RootStackParamList = {
    Main: NavigatorScreenParams<DrawerParamList> | undefined;

    // Articles
    'Articles.Show':   { id: number };
    'Articles.Create': undefined;
    'Articles.Edit':   { id: number };

    // Catégories
    'Categories.Show':   { id: number };
    'Categories.Create': undefined;
    'Categories.Edit':   { id: number };

    // Stock
    'Stock.MovementCreate': undefined;

    // Caisse
    'Cash.Show': { id: number };

    // Ventes
    'Sales.Show': { id: number };

    // Rapports
    'Reports.Sales': undefined;
    'Reports.Cash':  undefined;
    'Reports.Stock': undefined;

    // Admin
    'Admin.Users.Show':   { id: number };
    'Admin.Users.Create': undefined;
    'Admin.Users.Edit':   { id: number };

    // Paramètres
    'Settings.Password':   undefined;
    'Settings.Appearance': undefined;
    'Settings.TwoFactor':  undefined;
    'Settings.Printer':    undefined;

    // Divers
    Search: undefined;
};

export type DrawerParamList = {
    Dashboard:          undefined;
    'Sales.POS':        undefined;
    'Articles.List':    undefined;
    'Categories.List':  undefined;
    'Stock.Movements':  undefined;
    'Cash.Dashboard':   undefined;
    'Sales.List':       undefined;
    'Reports.Index':    undefined;
    'Admin.Users.List': undefined;
    'Settings.Profile': undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}