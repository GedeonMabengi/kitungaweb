// src/navigation/routes.ts

/**
 * Catalogue central des écrans React Native.
 * Remplace les helpers Wayfinder (`articles.index()`, etc.)
 * du projet web, qui ne sont pas utilisables côté RN.
 */
export const ROUTES = {
    // --- App ---
    Dashboard: 'Dashboard',

    // --- Articles ---
    Articles: {
        List:   'Articles.List',
        Show:   'Articles.Show',
        Create: 'Articles.Create',
        Edit:   'Articles.Edit',
    },

    // --- Categories ---
    Categories: {
        List:   'Categories.List',
        Show:   'Categories.Show',
        Create: 'Categories.Create',
        Edit:   'Categories.Edit',
    },

    // --- Stock ---
    Stock: {
        Movements:       'Stock.Movements',
        MovementCreate:  'Stock.MovementCreate',
    },

    // --- Cash (Caisse) ---
    Cash: {
        Dashboard: 'Cash.Dashboard',
        List:      'Cash.List',
        Show:      'Cash.Show',
    },

    // --- Sales (Ventes / POS) ---
    Sales: {
        POS:  'Sales.POS',
        List: 'Sales.List',
        Show: 'Sales.Show',
    },

    // --- Reports ---
    Reports: {
        Index: 'Reports.Index',
        Sales: 'Reports.Sales',
        Cash:  'Reports.Cash',
        Stock: 'Reports.Stock',
    },

    // --- Admin ---
    Admin: {
        Users: {
            List:   'Admin.Users.List',
            Show:   'Admin.Users.Show',
            Create: 'Admin.Users.Create',
            Edit:   'Admin.Users.Edit',
        },
    },

    // --- Organization ---
    Organization: {
        Show:             'Organization.Show',
        AcceptInvitation: 'Organization.AcceptInvitation',
    },

    // --- Settings ---
    Settings: {
        Profile:    'Settings.Profile',
        Password:   'Settings.Password',
        Appearance: 'Settings.Appearance',
        TwoFactor:  'Settings.TwoFactor',
        Printer:    'Settings.Printer',
    },
} as const;