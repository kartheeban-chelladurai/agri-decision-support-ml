import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  unit?: string;
  helperText?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  unit,
  helperText,
  error,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.borderFocused;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      <TextInput
        style={[
          styles.input,
          { borderColor: getBorderColor(), backgroundColor: error ? theme.colors.errorLight : theme.colors.surface },
          props.style,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.textTertiary}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>⚠ {error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.lg },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs },
  label: { ...theme.typography.label, color: theme.colors.textSecondary },
  unit: { ...theme.typography.bodySm, color: theme.colors.textTertiary },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.bodyLg,
    color: theme.colors.text,
  },
  helperText: { ...theme.typography.bodySm, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
  errorText: { ...theme.typography.bodySm, color: theme.colors.error, marginTop: theme.spacing.xs },
});
