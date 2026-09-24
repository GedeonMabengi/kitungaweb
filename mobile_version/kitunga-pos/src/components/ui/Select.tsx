// src/components/ui/Select.tsx
import * as React from 'react';
import {
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { BottomSheet } from './BottomSheet';

const P = {
    border: '#E4E4E7',
    fg: '#18181B',
    muted: '#71717A',
    background: 'transparent',
    accent: '#F4F4F5',
    invalid: '#DC2626',
    placeholder: '#A1A1AA',
};

export type SelectOption<T = string> = {
    label: string;
    value: T;
    disabled?: boolean;
};

export type SelectProps<T = string> = {
    value: T | null | undefined;
    onValueChange: (value: T) => void;
    options: SelectOption<T>[];
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    /** Titre affiché en haut du BottomSheet */
    title?: string;
    containerStyle?: StyleProp<ViewStyle>;
    triggerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    testID?: string;
};

export function Select<T extends string | number = string>({
    value,
    onValueChange,
    options,
    placeholder = 'Sélectionner…',
    disabled = false,
    invalid = false,
    title,
    containerStyle,
    triggerStyle,
    textStyle,
    testID,
}: SelectProps<T>) {
    const [open, setOpen] = React.useState(false);
    const selected = options.find((o) => o.value === value);

    const handleSelect = (v: T) => {
        onValueChange(v);
        setOpen(false);
    };

    return (
        <>
            <Pressable
                testID={testID}
                onPress={() => !disabled && setOpen(true)}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.trigger,
                    invalid && styles.triggerInvalid,
                    disabled && styles.triggerDisabled,
                    pressed && !disabled && { opacity: 0.7 },
                    containerStyle,
                    triggerStyle,
                ]}
            >
                <Text
                    numberOfLines={1}
                    style={[
                        styles.triggerText,
                        !selected && styles.placeholder,
                        textStyle,
                    ]}
                >
                    {selected ? selected.label : placeholder}
                </Text>
                <ChevronDown size={16} color={P.muted} />
            </Pressable>

            <BottomSheet
                visible={open}
                onClose={() => setOpen(false)}
                maxHeightRatio={0.7}
            >
                {title ? (
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>{title}</Text>
                    </View>
                ) : null}

                <ScrollView
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        const isDisabled = option.disabled === true;
                        return (
                            <Pressable
                                key={String(option.value)}
                                onPress={() =>
                                    !isDisabled && handleSelect(option.value)
                                }
                                disabled={isDisabled}
                                style={({ pressed }) => [
                                    styles.item,
                                    isSelected && styles.itemSelected,
                                    pressed && !isDisabled && { opacity: 0.7 },
                                    isDisabled && { opacity: 0.4 },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.itemText,
                                        isSelected && styles.itemTextSelected,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {option.label}
                                </Text>
                                {isSelected ? (
                                    <Check size={18} color={P.fg} strokeWidth={2.5} />
                                ) : null}
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </BottomSheet>
        </>
    );
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------
const styles = StyleSheet.create({
    trigger: {
        minHeight: 40,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: P.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: P.background,
        gap: 8,
    },
    triggerInvalid: {
        borderColor: P.invalid,
    },
    triggerDisabled: {
        opacity: 0.5,
    },
    triggerText: {
        flex: 1,
        fontSize: 15,
        color: P.fg,
    },
    placeholder: {
        color: P.placeholder,
    },
    sheetHeader: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: P.fg,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingBottom: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 8,
    },
    itemSelected: {
        backgroundColor: P.accent,
    },
    itemText: {
        flex: 1,
        fontSize: 15,
        color: P.fg,
    },
    itemTextSelected: {
        fontWeight: '600',
    },
});