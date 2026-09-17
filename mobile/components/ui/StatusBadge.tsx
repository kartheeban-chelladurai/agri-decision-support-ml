import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'crop' | 'season';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success': return theme.colors.successLight;
      case 'warning': return theme.colors.warningLight;
      case 'error': return theme.colors.errorLight;
      case 'crop': return theme.colors.primarySurface;
      case 'season': return theme.colors.surfaceAlt;
      default: return '#F3F4F6';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'crop': return theme.colors.primaryDark;
      case 'season': return theme.colors.text;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text style={[styles.text, { color: getTextColor() }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 24,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.labelSm,
  },
});
