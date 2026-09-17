import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { AppButton } from './AppButton';

interface ErrorStateProps {
  message: string;
  style?: object;
  onRetry?: () => void;
}

export function ErrorState({ message, style, onRetry }: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <AppButton title="Retry" variant="ghost" onPress={onRetry} style={styles.retryBtn} textStyle={{ fontSize: 14 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2', // Light red
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  text: {
    ...theme.typography.bodySm,
    color: theme.colors.error,
  },
  retryBtn: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  }
});
