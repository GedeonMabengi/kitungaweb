// src/components/layout/KeyboardAwareScrollView.tsx
import * as React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type KeyboardAwareScrollViewProps = {
    children: React.ReactNode;
    contentContainerStyle?: StyleProp<ViewStyle>;
    keyboardVerticalOffset?: number;
};

export function KeyboardAwareScrollView({
    children,
    contentContainerStyle,
    keyboardVerticalOffset = 0,
}: KeyboardAwareScrollViewProps) {
    const insets = useSafeAreaInsets();

    let headerHeight = 0;
    try {
        headerHeight = useHeaderHeight();
    } catch {
        headerHeight = 0;
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={
                Platform.OS === 'ios'
                    ? headerHeight + insets.top + keyboardVerticalOffset
                    : 0
            }
        >
            <ScrollView
                contentContainerStyle={[
                    { flexGrow: 1, paddingBottom: 60 + insets.bottom },
                    contentContainerStyle,
                ]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
});
