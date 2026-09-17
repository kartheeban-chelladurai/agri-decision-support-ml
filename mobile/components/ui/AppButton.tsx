import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.skeleton;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return 'transparent';
      case 'ghost': return 'transparent';
      case 'danger': return 'transparent';
      default: return theme.colors.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    switch (variant) {
      case 'secondary': return theme.colors.primary;
      case 'danger': return theme.colors.error;
      default: return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textTertiary;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return theme.colors.primary;
      case 'ghost': return theme.colors.textSecondary;
      case 'danger': return theme.colors.error;
      default: return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'secondary' || variant === 'danger' ? 1.5 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor() },
              icon ? { marginLeft: theme.spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    ...theme.typography.buttonLg,
  },
});
