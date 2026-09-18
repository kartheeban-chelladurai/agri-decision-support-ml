import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { theme } from '../../constants/theme';
import { YieldHistoryItem } from '../../types/history';

export default function YieldResultScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();

  if (!data) return null;
  const resultItem: YieldHistoryItem = JSON.parse(data);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppCard variant="highlighted" style={styles.resultCard}>
        <Text style={styles.resultLabel}>ESTIMATED YIELD</Text>
        <Text style={styles.yieldValue}>{resultItem.result.yield_value.toFixed(3)}</Text>
        <Text style={styles.yieldUnit}>production units per hectare</Text>
        <Text style={styles.totalProduction}>
          Total for {resultItem.input.area.toLocaleString()} ha:{' '}
          {resultItem.result.total_production.toLocaleString(undefined, { maximumFractionDigits: 1 })} units
        </Text>
        <Text style={styles.disclaimer}>{resultItem.result.unit_note}</Text>
        <View style={styles.badges}>
          <StatusBadge variant="season" label={`Model: ${resultItem.result.model_used}`} />
        </View>
      </AppCard>

      <Text style={styles.sectionTitle}>Input Summary</Text>
      <AppCard style={styles.summaryCard}>
        <View style={styles.row}><Text style={styles.label}>Crop</Text><Text style={styles.value}>{resultItem.input.crop}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Season</Text><Text style={styles.value}>{resultItem.input.season}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Temperature</Text><Text style={styles.value}>{resultItem.input.temperature} °C</Text></View>
        <View style={styles.row}><Text style={styles.label}>Humidity</Text><Text style={styles.value}>{resultItem.input.humidity} %</Text></View>
        <View style={styles.row}><Text style={styles.label}>Soil Moisture</Text><Text style={styles.value}>{resultItem.input.soil_moisture} %</Text></View>
        <View style={styles.row}><Text style={styles.label}>Area</Text><Text style={styles.value}>{resultItem.input.area} ha</Text></View>
      </AppCard>

      <View style={styles.actions}>
        <AppButton title="New Analysis" onPress={() => router.replace('/analyze/yield-estimation')} />
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
  yieldValue: { ...theme.typography.displayLg, color: theme.colors.primaryDark, textAlign: 'center' },
  yieldUnit: { ...theme.typography.bodySm, color: theme.colors.textSecondary, marginBottom: theme.spacing.md, textAlign: 'center' },
  totalProduction: { ...theme.typography.bodyMd, color: theme.colors.text, fontWeight: '600', marginBottom: theme.spacing.sm, textAlign: 'center' },
  disclaimer: { ...theme.typography.bodySm, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg, paddingHorizontal: theme.spacing.lg },
  badges: { flexDirection: 'row', gap: theme.spacing.sm },
  sectionTitle: { ...theme.typography.headingMd, color: theme.colors.text, marginBottom: theme.spacing.md },
  summaryCard: { marginBottom: theme.spacing['2xl'] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  label: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  value: { ...theme.typography.bodyMd, color: theme.colors.text, fontWeight: '600' },
  actions: { marginTop: theme.spacing.md },
});
