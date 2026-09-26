// src/components/layout/AppSidebar.tsx
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    DrawerContentScrollView,
    DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {
    LayoutGrid,
    Package,
    FolderTree,
    Warehouse,
    Wallet,
    ShoppingCart,
    BarChart3,
    Users,
    Settings,
    BookOpen,
} from 'lucide-react-native';

import type { NavItem } from '../../types/navigation';
import { ROUTES } from '../../navigation/routes';
import { AppLogo } from './AppLogo';
import { NavMain } from './NavMain';
import { NavFooter } from './NavFooter';
import { NavUser } from './NavUser';
import { Printer } from 'lucide-react-native';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard',  route: ROUTES.Dashboard,        icon: LayoutGrid },
    { title: 'POS',        route: ROUTES.Sales.POS,        icon: ShoppingCart },
    { title: 'Articles',   route: ROUTES.Articles.List,    icon: Package },
    { title: 'Catégories', route: ROUTES.Categories.List,  icon: FolderTree },
    { title: 'Stock',      route: ROUTES.Stock.Movements,  icon: Warehouse },
    { title: 'Caisse',     route: ROUTES.Cash.Dashboard,   icon: Wallet },
    { title: 'Ventes',     route: ROUTES.Sales.List,       icon: ShoppingCart },
    { title: 'Rapports',   route: ROUTES.Reports.Index,    icon: BarChart3 },
];

const adminNavItems: NavItem[] = [
    { title: 'Utilisateurs', route: ROUTES.Admin.Users.List, icon: Users },
];

const settingsNavItems: NavItem[] = [
    { title: 'Paramètres', route: ROUTES.Settings.Profile, icon: Settings },
    // { title: 'Paramètres', route: ROUTES.Settings.Profile, icon: Settings },
    { title: 'Imprimante', route: ROUTES.Settings.Printer, icon: Printer },
];


const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        route: 'https://laravel.com/docs',
        icon: BookOpen,
    },
];

export function AppSidebar(props: DrawerContentComponentProps) {
    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={styles.container}
        >
            <View style={styles.header}>
                <AppLogo />
            </View>

            <View style={styles.content}>
                <NavMain
                    items={mainNavItems}
                    label="Plateforme"
                    navigation={props.navigation}
                />
                <NavMain
                    items={adminNavItems}
                    label="Administration"
                    navigation={props.navigation}
                />
                <NavMain
                    items={settingsNavItems}
                    label="Paramètres"
                    navigation={props.navigation}
                />
            </View>

            <View style={styles.footer}>
                <NavFooter items={footerNavItems} navigation={props.navigation} />
                <NavUser />
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingBottom: 8 },
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    content: { flex: 1, gap: 8 },
    footer: {
        marginTop: 'auto',
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E4E4E7',
    },
});