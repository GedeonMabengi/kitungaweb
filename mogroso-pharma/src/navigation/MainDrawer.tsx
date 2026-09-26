// src/navigation/MainDrawer.tsx
import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { AppSidebar } from '../components/layout/AppSidebar';
import type { DrawerParamList } from './types';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PosScreen from '../screens/sales/PosScreen';
import ArticlesListScreen from '../screens/articles/ArticlesListScreen';
import CategoriesListScreen from '../screens/categories/CategoriesListScreen';
import StockMovementsListScreen from '../screens/stock/movements/StockMovementsListScreen';
import CashDashboardScreen from '../screens/cash/CashDashboardScreen';
import SalesListScreen from '../screens/sales/SalesListScreen';
import ReportsIndexScreen from '../screens/reports/ReportsIndexScreen';
import UsersListScreen from '../screens/admin/users/UsersListScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

export function MainDrawer() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <AppSidebar {...props} />}
            screenOptions={{
                headerShown: true, // le Stack parent gère le header
                drawerType: 'front',
                overlayColor: 'rgba(0,0,0,0.5)',
                swipeEdgeWidth: 80,
            }}
        >
            <Drawer.Screen name="Dashboard"          component={DashboardScreen}          options={{ title: 'Dashboard' }} />
            <Drawer.Screen name="Sales.POS"          component={PosScreen}                options={{ title: 'POS' }} />
            <Drawer.Screen name="Articles.List"      component={ArticlesListScreen}       options={{ title: 'Articles' }} />
            <Drawer.Screen name="Categories.List"    component={CategoriesListScreen}     options={{ title: 'Catégories' }} />
            <Drawer.Screen name="Stock.Movements"    component={StockMovementsListScreen} options={{ title: 'Stock' }} />
            <Drawer.Screen name="Cash.Dashboard"     component={CashDashboardScreen}      options={{ title: 'Caisse' }} />
            <Drawer.Screen name="Sales.List"         component={SalesListScreen}          options={{ title: 'Ventes' }} />
            <Drawer.Screen name="Reports.Index"      component={ReportsIndexScreen}       options={{ title: 'Rapports' }} />
            <Drawer.Screen name="Admin.Users.List"   component={UsersListScreen}          options={{ title: 'Utilisateurs' }} />
            <Drawer.Screen name="Settings.Profile"   component={ProfileScreen}            options={{ title: 'Paramètres' }} />
        </Drawer.Navigator>
    );
}