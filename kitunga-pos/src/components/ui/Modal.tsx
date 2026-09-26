// src/components/ui/Modal.tsx
import * as React from 'react';
import {
    Modal as RNModal,
    ModalProps as RNModalProps,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';

const P = {
    background: '#FFFFFF',
    border: '#E4E4E7',
    fg: '#18181B',
    muted: '#71717A',
    overlay: 'rgba(0, 0, 0, 0.6)',
};

// -------------------------------------------------------------
// Modal — wrapper principal
// -------------------------------------------------------------
export type ModalProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    /** Empêche la fermeture en tapant à l'extérieur */
    dismissOnOverlayPress?: boolean;
    /** Empêche la fermeture avec le bouton back Android */
    dismissOnBackPress?: boolean;
    /** 'fade' (défaut) | 'slide' | 'none' */
    animationType?: RNModalProps['animationType'];
    /** 'center' (défaut) ou 'bottom' (style bottom sheet) */
    position?: 'center' | 'bottom';
    /** Largeur max du contenu (center uniquement) */
    maxWidth?: number;
    testID?: string;
};

export function Modal({
    visible,
    onClose,
    children,
    dismissOnOverlayPress = true,
    dismissOnBackPress = true,
    animationType = 'fade',
    position = 'center',
    maxWidth = 500,
    testID,
}: ModalProps) {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType={animationType}
            onRequestClose={dismissOnBackPress ? onClose : undefined}
            statusBarTranslucent
        >
            <Pressable
                testID={testID}
                style={[
                    styles.overlay,
                    position === 'bottom' ? styles.overlayBottom : styles.overlayCenter,
                ]}
                onPress={dismissOnOverlayPress ? onClose : undefined}
            >
                {/* On stoppe la propagation du press sur le contenu */}
                <Pressable
                    style={[
                        styles.content,
                        position === 'bottom' && styles.contentBottom,
                        position === 'center' && { maxWidth, width: '100%' },
                    ]}
                    onPress={(e) => e.stopPropagation()}
                >
                    {children}
                </Pressable>
            </Pressable>
        </RNModal>
    );
}

// -------------------------------------------------------------
// ModalHeader — titre + description + bouton X
// -------------------------------------------------------------
export function ModalHeader({
    children,
    style,
    showClose = true,
    onClose,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    showClose?: boolean;
    onClose?: () => void;
}) {
    return (
        <View style={[styles.header, style]}>
            <View style={styles.headerText}>{children}</View>
            {showClose && onClose ? (
                <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    style={({ pressed }) => [
                        styles.closeBtn,
                        pressed && { opacity: 0.7 },
                    ]}
                >
                    <X size={18} color={P.muted} />
                </Pressable>
            ) : null}
        </View>
    );
}

// -------------------------------------------------------------
// ModalTitle
// -------------------------------------------------------------
export function ModalTitle({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
}) {
    return <Text style={[styles.title, style]}>{children}</Text>;
}

// -------------------------------------------------------------
// ModalDescription
// -------------------------------------------------------------
export function ModalDescription({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
}) {
    return <Text style={[styles.description, style]}>{children}</Text>;
}

// -------------------------------------------------------------
// ModalBody — zone de contenu libre
// -------------------------------------------------------------
export function ModalBody({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return <View style={[styles.body, style]}>{children}</View>;
}

// -------------------------------------------------------------
// ModalFooter — boutons d'action
// -------------------------------------------------------------
export function ModalFooter({
    children,
    style,
}: {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return <View style={[styles.footer, style]}>{children}</View>;
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: P.overlay,
    },
    overlayCenter: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    overlayBottom: {
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: P.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: P.border,
        padding: 24,
        gap: 16,
        // Ombre
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    contentBottom: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    headerText: {
        flex: 1,
        gap: 6,
    },
    closeBtn: {
        padding: 4,
        marginTop: -4,
        marginRight: -4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: P.fg,
        lineHeight: 22,
    },
    description: {
        fontSize: 14,
        color: P.muted,
        lineHeight: 18,
    },
    body: {
        // Zone libre — pas de style par défaut
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 4,
    },
});