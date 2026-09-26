// src/components/ui/Input.tsx
import * as React from 'react';
import {
    NativeSyntheticEvent,
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputFocusEventData,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

const P = {
    border: '#E4E4E7',
    borderFocus: '#18181B',
    borderInvalid: '#DC2626',
    fg: '#18181B',
    placeholder: '#A1A1AA',
    background: 'transparent',
    selection: '#18181B',
};

export type InputProps = Omit<TextInputProps, 'style'> & {
    /** Style du conteneur (bordures, padding, etc.) */
    containerStyle?: StyleProp<ViewStyle>;
    /** Style du TextInput lui-même (couleur du texte, taille…) */
    style?: StyleProp<TextStyle>;
    /** Bordure rouge + feedback visuel d'erreur */
    invalid?: boolean;
    /** Icône à gauche (ex: <Search size={16} />) */
    leftIcon?: React.ReactNode;
    /** Icône à droite (ex: bouton "œil" pour mot de passe) */
    rightIcon?: React.ReactNode;
    /** Change la couleur du placeholder (rare) */
    placeholderTextColor?: string;
};

export const Input = React.forwardRef<TextInput, InputProps>(function Input(
    {
        containerStyle,
        style,
        invalid = false,
        leftIcon,
        rightIcon,
        editable = true,
        onFocus,
        onBlur,
        placeholderTextColor = P.placeholder,
        ...props
    },
    ref,
) {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const isDisabled = !editable;

    return (
        <View
            style={[
                styles.container,
                isFocused && styles.containerFocused,
                invalid && styles.containerInvalid,
                isDisabled && styles.containerDisabled,
                containerStyle,
            ]}
        >
            {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

            <TextInput
                ref={ref}
                editable={editable}
                placeholderTextColor={placeholderTextColor}
                selectionColor={P.selection}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={[styles.input, style]}
                // Empêche l'auto-correction sur les champs techniques
                autoCorrect={false}
                {...props}
            />

            {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
    );
});

const HEIGHT = 40;

const styles = StyleSheet.create({
    container: {
        minHeight: HEIGHT,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: P.border,
        borderRadius: 8,
        backgroundColor: P.background,
        paddingHorizontal: 12,
    },
    containerFocused: {
        borderColor: P.borderFocus,
    },
    containerInvalid: {
        borderColor: P.borderInvalid,
    },
    containerDisabled: {
        opacity: 0.5,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: P.fg,
        paddingVertical: 8,
        // Pour aligner verticalement au centre
        textAlignVertical: 'center',
    },
    iconLeft: {
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconRight: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});