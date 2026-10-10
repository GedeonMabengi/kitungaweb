// src/components/ui/BottomSheet.tsx
import * as React from 'react';
import {
    KeyboardAvoidingView,
    Modal as RNModal,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const P = {
    background: '#FFFFFF',
    border: '#E4E4E7',
    fg: '#18181B',
    muted: '#71717A',
    overlay: 'rgba(0, 0, 0, 0.6)',
    handle: '#D4D4D8',
};

export type BottomSheetProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    showHandle?: boolean;
    showClose?: boolean;
    dismissOnOverlayPress?: boolean;
    maxHeightRatio?: number;
    testID?: string;
};

export function BottomSheet({
    visible,
    onClose,
    children,
    showHandle = true,
    showClose = true,
    dismissOnOverlayPress = true,
    maxHeightRatio = 0.85,
    testID,
}: BottomSheetProps) {
    const insets = useSafeAreaInsets();
    if (!visible) return null;

    const ratio = Math.min(Math.max(maxHeightRatio, 0.3), 0.95);
    const maxHeightPercent = `${Math.round(ratio * 100)}%` as const;

    return (
        <RNModal
            visible
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior="padding"
            >
                <Pressable
                    testID={testID}
                    style={styles.overlayPressable}
                    onPress={dismissOnOverlayPress ? onClose : undefined}
                >
                    <Pressable
                        style={[
                            styles.sheet,
                            {
                                maxHeight: maxHeightPercent as any,
                                paddingBottom: 24 + insets.bottom,
                            },
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        {showHandle ? (
                            <View style={styles.handleWrapper}>
                                <View style={styles.handle} />
                            </View>
                        ) : null}

                        {showClose ? (
                            <Pressable
                                onPress={onClose}
                                hitSlop={10}
                                style={({ pressed }) => [
                                    styles.closeBtn,
                                    pressed && { opacity: 0.7 },
                                ]}
                            >
                                <X size={18} color={P.muted} />
                            </Pressable>
                        ) : null}

                        {children}
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </RNModal>
    );
}

export function BottomSheetHeader({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return <View style={[styles.header, style]}>{children}</View>;
}

export function BottomSheetTitle({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
}) {
    return <Text style={[styles.title, style]}>{children}</Text>;
}

export function BottomSheetDescription({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
}) {
    return <Text style={[styles.description, style]}>{children}</Text>;
}

export function BottomSheetBody({
    children,
    style,
    scrollable = false,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scrollable?: boolean;
}) {
    if (scrollable) {
        return (
            <ScrollView
                contentContainerStyle={[styles.body, style]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        );
    }
    return <View style={[styles.body, style]}>{children}</View>;
}

export function BottomSheetFooter({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: P.overlay,
        justifyContent: 'flex-end',
    },
    overlayPressable: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: P.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 12,
    },
    handleWrapper: { alignItems: 'center', paddingVertical: 8 },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: P.handle,
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        right: 16,
        padding: 4,
        zIndex: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        gap: 4,
    },
    title: { fontSize: 17, fontWeight: '600', color: P.fg },
    description: { fontSize: 13, color: P.muted },
    body: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 8,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 8,
    },
});
