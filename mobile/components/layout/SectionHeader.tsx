import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, style }) => {
  return <Text style={[styles.title, style]}>{title.toUpperCase()}</Text>;
};

const styles = StyleSheet.create({
  title: {
    ...theme.typography.labelSm,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
});
