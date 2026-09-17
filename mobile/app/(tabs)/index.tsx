import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { theme } from '../../constants/theme';
import { historyService } from '../../services/history';
import { profileService } from '../../services/profile';
import { soilService } from '../../services/soil';
import { HistoryItem } from '../../types/history';
import { UserProfile } from '../../types/profile';
import { SoilData } from '../../types/soil';

export default function HomeScreen() {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<HistoryItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [soil, setSoil] = useState<SoilData | null>(null);

  useFocusEffect(
    useCallback(() => {
      historyService.getHistory().then(items => setRecentItems(items.slice(0, 3)));
      profileService.getProfile().then(setProfile);
      soilService.getSoilData().then(setSoil);
    }, [])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {profile?.name ? profile.name.split(' ')[0] : 'Farmer'} 👋</Text>
        <Text style={styles.subtitle}>{profile?.farmName || 'Welcome to AgriSense'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <AppCard style={styles.actionCard} variant="standard">
          <Text style={styles.actionTitle}>🌱 Crop</Text>
          <Text style={styles.actionDesc}>Find the best crop</Text>
          <AppButton title="Analyze" variant="ghost" onPress={() => router.push('/analyze/crop-recommendation')} style={styles.actionBtn} />
        </AppCard>
        <AppCard style={styles.actionCard} variant="standard">
          <Text style={styles.actionTitle}>📊 Yield</Text>
          <Text style={styles.actionDesc}>Estimate harvest</Text>
          <AppButton title="Analyze" variant="ghost" onPress={() => router.push('/analyze/yield-estimation')} style={styles.actionBtn} />
        </AppCard>
      </View>

      <Text style={styles.sectionTitle}>Soil Snapshot</Text>
      {soil ? (
        <AppCard style={styles.soilCard} variant="outlined">
          <View style={styles.soilGrid}>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>N</Text><Text style={styles.soilValue}>{soil.N}</Text></View>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>P</Text><Text style={styles.soilValue}>{soil.P}</Text></View>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>K</Text><Text style={styles.soilValue}>{soil.K}</Text></View>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>pH</Text><Text style={styles.soilValue}>{soil.ph}</Text></View>
          </View>
        </AppCard>
      ) : (
        <AppCard style={styles.emptyState} variant="outlined">
          <Text style={styles.emptyText}>Add your soil data to prefill forms</Text>
          <AppButton title="Add Soil Data" variant="ghost" onPress={() => router.push('/profile/soil')} style={{ marginTop: theme.spacing.md }} />
        </AppCard>
      )}

      <Text style={styles.sectionTitle}>Recent Analyses</Text>
      {recentItems.length > 0 ? (
        recentItems.map(item => (
          <AppCard key={item.id} style={styles.historyCard} variant="standard">
            <Text style={styles.historyType}>{item.type === 'crop' ? '🌱 Crop Recommendation' : '📊 Yield Estimation'}</Text>
            <Text style={styles.historyResult}>
              {item.type === 'crop' ? item.result.crop.toUpperCase() : `${item.result.total_production.toLocaleString()} units`}
            </Text>
            <Text style={styles.historyDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
          </AppCard>
        ))
      ) : (
        <AppCard style={styles.emptyState} variant="outlined">
          <Text style={styles.emptyText}>No analyses yet</Text>
          <AppButton title="Start Analysis" variant="ghost" onPress={() => router.push('/(tabs)/analyze')} style={{ marginTop: theme.spacing.md }} />
        </AppCard>
      )}

      <Text style={styles.sectionTitle}>Agriculture Tip</Text>
      <AppCard style={styles.tipCard} variant="highlighted">
        <Text style={styles.tipText}>
          Crop rotation helps maintain soil health, reduces soil erosion, and improves crop yield by disrupting pest and disease cycles. Consider alternating nitrogen-fixing legumes with heavy-feeding crops.
        </Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing['3xl'] },
  header: { marginBottom: theme.spacing['2xl'], marginTop: theme.spacing.md },
  greeting: { ...theme.typography.displayLg, color: theme.colors.text },
  subtitle: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  sectionTitle: { ...theme.typography.headingLg, color: theme.colors.text, marginBottom: theme.spacing.md },
  quickActions: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing['2xl'] },
  actionCard: { flex: 1, padding: theme.spacing.md },
  actionTitle: { ...theme.typography.headingMd, color: theme.colors.text, marginBottom: theme.spacing.xs },
  actionDesc: { ...theme.typography.bodySm, color: theme.colors.textSecondary },
  actionBtn: { marginTop: theme.spacing.md, paddingHorizontal: 0, alignSelf: 'flex-start' },
  emptyState: { padding: theme.spacing.xl, alignItems: 'center', marginBottom: theme.spacing['2xl'] },
  emptyText: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  historyCard: { marginBottom: theme.spacing.md },
  historyType: { ...theme.typography.labelSm, color: theme.colors.textTertiary, marginBottom: theme.spacing.xs },
  historyResult: { ...theme.typography.headingLg, color: theme.colors.primaryDark, marginBottom: theme.spacing.xs },
  historyDate: { ...theme.typography.bodySm, color: theme.colors.textSecondary },
  soilCard: { padding: theme.spacing.md, marginBottom: theme.spacing['2xl'] },
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  soilItem: { flex: 1, minWidth: '40%', backgroundColor: theme.colors.background, padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  soilLabel: { ...theme.typography.labelSm, color: theme.colors.textTertiary },
  soilValue: { ...theme.typography.headingMd, color: theme.colors.text },
  tipCard: { padding: theme.spacing.lg },
  tipText: { ...theme.typography.bodyMd, color: theme.colors.primaryDark, lineHeight: 22 },
});
