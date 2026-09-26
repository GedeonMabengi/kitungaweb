// src/navigation/RootNavigator.tsx
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';
import { MainDrawer } from './MainDrawer';

// Screens
import ArticleShowScreen         from '../screens/articles/ArticleShowScreen';
import ArticleCreateScreen       from '../screens/articles/ArticleCreateScreen';
import ArticleEditScreen         from '../screens/articles/ArticleEditScreen';

import CategoryShowScreen        from '../screens/categories/CategoryShowScreen';
import CategoryCreateScreen      from '../screens/categories/CategoryCreateScreen';
import CategoryEditScreen        from '../screens/categories/CategoryEditScreen';

import StockMovementCreateScreen from '../screens/stock/movements/StockMovementCreateScreen';

import CashListScreen            from '../screens/cash/CashListScreen';
import CashShowScreen            from '../screens/cash/CashShowScreen';

import SaleShowScreen            from '../screens/sales/SaleShowScreen';

import ReportsSalesScreen        from '../screens/reports/ReportsSalesScreen';
import ReportsCashScreen         from '../screens/reports/ReportsCashScreen';
import ReportsStockScreen        from '../screens/reports/ReportsStockScreen';

import UserShowScreen            from '../screens/admin/users/UserShowScreen';
import UserCreateScreen          from '../screens/admin/users/UserCreateScreen';
import UserEditScreen            from '../screens/admin/users/UserEditScreen';

import PasswordScreen            from '../screens/settings/PasswordScreen';
import AppearanceScreen          from '../screens/settings/AppearanceScreen';
import TwoFactorScreen           from '../screens/settings/TwoFactorScreen';
import PrinterScreen             from '../screens/settings/PrinterScreen';

import SearchScreen              from '../screens/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTintColor: '#18181B',
                headerTitleStyle: { fontWeight: '600', fontSize: 16 },
                headerShadowVisible: false,
                headerBackTitle: 'Retour',
                contentStyle: { backgroundColor: '#FAFAFA' },
            }}
        >
            <Stack.Screen
                name="Main"
                component={MainDrawer}
                options={{ headerShown: false }}
            />

            <Stack.Screen name="Articles.Show"        component={ArticleShowScreen}         options={{ title: 'Détail article' }} />
            <Stack.Screen name="Articles.Create"      component={ArticleCreateScreen}       options={{ title: 'Nouvel article' }} />
            <Stack.Screen name="Articles.Edit"        component={ArticleEditScreen}         options={{ title: 'Modifier article' }} />

            <Stack.Screen name="Categories.Show"      component={CategoryShowScreen}        options={{ title: 'Détail catégorie' }} />
            <Stack.Screen name="Categories.Create"    component={CategoryCreateScreen}      options={{ title: 'Nouvelle catégorie' }} />
            <Stack.Screen name="Categories.Edit"      component={CategoryEditScreen}        options={{ title: 'Modifier catégorie' }} />

            <Stack.Screen name="Stock.MovementCreate" component={StockMovementCreateScreen} options={{ title: 'Nouveau mouvement' }} />

            <Stack.Screen name="Cash.List"            component={CashListScreen}            options={{ title: 'Historique de caisse' }} />
            <Stack.Screen name="Cash.Show"            component={CashShowScreen}            options={{ title: 'Détail caisse' }} />

            <Stack.Screen name="Sales.Show"           component={SaleShowScreen}            options={{ title: 'Détail vente' }} />

            <Stack.Screen name="Reports.Sales"        component={ReportsSalesScreen}        options={{ title: 'Rapport des ventes' }} />
            <Stack.Screen name="Reports.Cash"         component={ReportsCashScreen}         options={{ title: 'Rapport de caisse' }} />
            <Stack.Screen name="Reports.Stock"        component={ReportsStockScreen}        options={{ title: 'Rapport de stock' }} />

            <Stack.Screen name="Admin.Users.Show"     component={UserShowScreen}            options={{ title: 'Détail utilisateur' }} />
            <Stack.Screen name="Admin.Users.Create"   component={UserCreateScreen}          options={{ title: 'Nouvel utilisateur' }} />
            <Stack.Screen name="Admin.Users.Edit"     component={UserEditScreen}            options={{ title: 'Modifier utilisateur' }} />

            <Stack.Screen name="Settings.Password"    component={PasswordScreen}            options={{ title: 'Mot de passe' }} />
            <Stack.Screen name="Settings.Appearance"  component={AppearanceScreen}          options={{ title: 'Apparence' }} />
            <Stack.Screen name="Settings.TwoFactor"   component={TwoFactorScreen}           options={{ title: 'Double authentification' }} />
            <Stack.Screen name="Settings.Printer"     component={PrinterScreen}             options={{ title: 'Imprimante' }} />

            <Stack.Screen name="Search"               component={SearchScreen}              options={{ title: 'Recherche' }} />
            {/* <Stack.Screen name="Settings.Printer"     component={PrinterScreen}             options={{ title: 'Imprimante' }}/> */}
        </Stack.Navigator>
    );
}