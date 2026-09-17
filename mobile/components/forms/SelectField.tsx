import React from 'react';
import { View, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../../constants/theme';

interface SelectFieldProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  loading?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
  loading = false,
  error,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerContainer, error ? { borderColor: theme.colors.error, backgroundColor: theme.colors.errorLight } : null]}>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : (
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor={theme.colors.textSecondary}
          >
            <Picker.Item label={`Select ${label}...`} value="" color={theme.colors.textTertiary} />
            {options.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} color={theme.colors.text} />
            ))}
          </Picker>
        )}
      </View>
      {error && <Text style={styles.errorText}>⚠ {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.lg },
  label: { ...theme.typography.label, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    color: theme.colors.text,
  },
  loader: {
    padding: theme.spacing.md,
  },
  errorText: { ...theme.typography.bodySm, color: theme.colors.error, marginTop: theme.spacing.xs },
});
