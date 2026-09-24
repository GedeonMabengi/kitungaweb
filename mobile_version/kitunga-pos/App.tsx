// App.tsx
import 'react-native-gesture-handler'; // ⚠️ DOIT ÊTRE EN PREMIER
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import { getDb } from './src/data/db/client';
import { seedDatabase } from './src/data/db/seed';
import { seedSession } from './src/data/seedSession';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                await getDb();
                await seedDatabase();
                seedSession();
                setReady(true);
            } catch (e) {
                console.error('[App] init error', e);
                setError(e instanceof Error ? e.message : String(e));
            }
        })();
    }, []);

    if (error) {
        return (
            <SafeAreaProvider>
                <View style={styles.center}>
                    <Text style={styles.errorTitle}>Erreur d’initialisation</Text>
                    <Text style={styles.errorMsg}>{error}</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    if (!ready) {
        return (
            <SafeAreaProvider>
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loading}>Initialisation…</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#FAFAFA',
    },
    loading: { marginTop: 12, color: '#71717A' },
    errorTitle: { fontSize: 18, fontWeight: '700', color: '#DC2626' },
    errorMsg: { marginTop: 8, color: '#71717A', textAlign: 'center' },
});