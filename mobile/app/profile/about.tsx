import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppCard } from '../../components/ui/AppCard';
import { theme } from '../../constants/theme';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>AgriSense</Text>
        <Text style={styles.tagline}>Smart Agriculture Decision Support</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>
          AgriSense provides machine-learning based agricultural decision support to help farmers optimize crop selection and estimate yields. 
        </Text>
        <Text style={styles.body}>
          Please note that the recommendations provided are based on predictive models and should be considered as decision support rather than absolute guarantees. Local field conditions, extreme weather, and market factors also play a critical role in agricultural success.
        </Text>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Technology</Text>
        <View style={styles.techRow}>
          <Text style={styles.techBullet}>•</Text>
          <Text style={styles.body}>React Native / Expo</Text>
        </View>
        <View style={styles.techRow}>
          <Text style={styles.techBullet}>•</Text>
          <Text style={styles.body}>FastAPI Backend</Text>
        </View>
        <View style={styles.techRow}>
          <Text style={styles.techBullet}>•</Text>
          <Text style={styles.body}>Scikit-Learn Machine Learning</Text>
        </View>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  header: { alignItems: 'center', marginVertical: theme.spacing['2xl'] },
  appName: { ...theme.typography.displayLg, color: theme.colors.primaryDark },
  tagline: { ...theme.typography.bodyMd, color: theme.colors.textSecondary, marginTop: theme.spacing.xs, textAlign: 'center' },
  version: { ...theme.typography.labelSm, color: theme.colors.textTertiary, marginTop: theme.spacing.md },
  card: { padding: theme.spacing.lg, marginBottom: theme.spacing.lg },
  sectionTitle: { ...theme.typography.headingMd, color: theme.colors.text, marginBottom: theme.spacing.md },
  body: { ...theme.typography.bodyMd, color: theme.colors.textSecondary, lineHeight: 24, marginBottom: theme.spacing.md },
  techRow: { flexDirection: 'row', marginBottom: theme.spacing.sm },
  techBullet: { ...theme.typography.bodyMd, color: theme.colors.primary, marginRight: theme.spacing.sm, fontWeight: 'bold' },
});
