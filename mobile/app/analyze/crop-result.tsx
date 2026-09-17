import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { theme } from '../../constants/theme';
import { CropHistoryItem } from '../../types/history';

export default function CropResultScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();

  if (!data) return null;
  const resultItem: CropHistoryItem = JSON.parse(data);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppCard variant="highlighted" style={styles.resultCard}>
        <Text style={styles.resultLabel}>RECOMMENDED CROP</Text>
        <Text style={styles.cropName}>{resultItem.result.crop.toUpperCase()}</Text>
        <Text style={styles.disclaimer}>
          Based on your entered soil and environmental parameters
        </Text>
        <View style={styles.badges}>
          <StatusBadge variant="crop" label={`Model: ${resultItem.result.model_used}`} />
        </View>
      </AppCard>

      <Text style={styles.sectionTitle}>Input Summary</Text>
      <AppCard style={styles.summaryCard}>
        <View style={styles.row}><Text style={styles.label}>N-P-K</Text><Text style={styles.value}>{resultItem.input.N} - {resultItem.input.P} - {resultItem.input.K}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Temperature</Text><Text style={styles.value}>{resultItem.input.temperature} °C</Text></View>
        <View style={styles.row}><Text style={styles.label}>Humidity</Text><Text style={styles.value}>{resultItem.input.humidity} %</Text></View>
        <View style={styles.row}><Text style={styles.label}>Soil pH</Text><Text style={styles.value}>{resultItem.input.ph}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Rainfall</Text><Text style={styles.value}>{resultItem.input.rainfall} mm</Text></View>
      </AppCard>

      <View style={styles.actions}>
        <AppButton title="New Analysis" onPress={() => router.replace('/analyze/crop-recommendation')} />
        <AppButton title="Back to Analyze Hub" variant="ghost" onPress={() => router.replace('/(tabs)/analyze')} style={{ marginTop: theme.spacing.md }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing['3xl'] },
  resultCard: { alignItems: 'center', paddingVertical: theme.spacing['3xl'], marginBottom: theme.spacing['2xl'] },
  resultLabel: { ...theme.typography.labelSm, color: theme.colors.primaryDark, marginBottom: theme.spacing.sm },
  cropName: { ...theme.typography.displayLg, color: theme.colors.primaryDark, marginBottom: theme.spacing.md, textAlign: 'center' },
  disclaimer: { ...theme.typography.bodySm, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg, paddingHorizontal: theme.spacing.lg },
  badges: { flexDirection: 'row', gap: theme.spacing.sm },
  sectionTitle: { ...theme.typography.headingMd, color: theme.colors.text, marginBottom: theme.spacing.md },
  summaryCard: { marginBottom: theme.spacing['2xl'] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  label: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  value: { ...theme.typography.bodyMd, color: theme.colors.text, fontWeight: '600' },
  actions: { marginTop: theme.spacing.md },
});
