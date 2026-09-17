import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  variant?: 'standard' | 'highlighted' | 'outlined' | 'flat';
  style?: ViewStyle;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'standard',
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'highlighted': return theme.colors.primarySurface;
      case 'flat': return theme.colors.surfaceAlt;
      default: return theme.colors.surface;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outlined') return theme.colors.border;
    return 'transparent';
  };

  const getShadow = () => {
    if (variant === 'standard') return theme.shadows.sm;
    return theme.shadows.none;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
          ...getShadow(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
  },
});
