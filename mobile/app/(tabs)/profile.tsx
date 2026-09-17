import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppCard } from '../../components/ui/AppCard';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { theme } from '../../constants/theme';
import { profileService } from '../../services/profile';
import { soilService } from '../../services/soil';
import { settingsService } from '../../services/settings';
import { UserProfile } from '../../types/profile';
import { SoilData } from '../../types/soil';
import { AppSettings } from '../../types/settings';
import { User, MapPin, Edit2, Sprout, Settings, Info } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [soil, setSoil] = useState<SoilData | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useFocusEffect(
    useCallback(() => {
      profileService.getProfile().then(setProfile);
      soilService.getSoilData().then(setSoil);
      settingsService.getSettings().then(setSettings);
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {/* @ts-ignore */}
          <User size={40} color={theme.colors.primaryDark} />
        </View>
        <Text style={styles.name}>{profile?.name || 'Guest Farmer'}</Text>
        <Text style={styles.farmName}>{profile?.farmName || 'No farm configured'}</Text>
      </View>

      <SectionHeader title="PROFILE" style={styles.sectionHeader} />
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{profile?.location || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Farm Area</Text>
          <Text style={styles.value}>{profile?.farmArea ? `${profile.farmArea} ${profile.farmAreaUnit}` : '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Primary Crop</Text>
          <Text style={styles.value}>{profile?.primaryCrop || '-'}</Text>
        </View>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/edit')}>
          {/* @ts-ignore */}
          <Edit2 size={18} color={theme.colors.primary} />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
      </AppCard>

      <SectionHeader title="FARM DATA" style={styles.sectionHeader} />
      <AppCard style={styles.card}>
        {soil ? (
          <View style={styles.soilGrid}>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>N</Text><Text style={styles.soilValue}>{soil.N}</Text></View>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>P</Text><Text style={styles.soilValue}>{soil.P}</Text></View>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>K</Text><Text style={styles.soilValue}>{soil.K}</Text></View>
            <View style={styles.soilItem}><Text style={styles.soilLabel}>pH</Text><Text style={styles.soilValue}>{soil.ph}</Text></View>
          </View>
        ) : (
          <Text style={styles.emptyText}>No manual soil data saved.</Text>
        )}
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/soil')}>
          {/* @ts-ignore */}
          <Sprout size={18} color={theme.colors.primary} />
          <Text style={styles.actionText}>{soil ? 'Update Soil Data' : 'Add Soil Data'}</Text>
        </TouchableOpacity>
      </AppCard>

      <SectionHeader title="PREFERENCES" style={styles.sectionHeader} />
      <AppCard style={styles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/settings')}>
          {/* @ts-ignore */}
          <Settings size={18} color={theme.colors.primary} />
          <Text style={styles.actionText}>App Settings</Text>
        </TouchableOpacity>
      </AppCard>

      <SectionHeader title="ABOUT" style={styles.sectionHeader} />
      <AppCard style={styles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/about')}>
          {/* @ts-ignore */}
          <Info size={18} color={theme.colors.primary} />
          <Text style={styles.actionText}>About AgriSense</Text>
        </TouchableOpacity>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing['3xl'] },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.md },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  name: { ...theme.typography.headingLg, color: theme.colors.text },
  farmName: { ...theme.typography.bodyMd, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  sectionHeader: { marginTop: theme.spacing.md },
  card: { padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  label: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  value: { ...theme.typography.bodyMd, color: theme.colors.text, fontWeight: '500' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingTop: theme.spacing.md, gap: theme.spacing.sm },
  actionText: { ...theme.typography.label, color: theme.colors.primary },
  emptyText: { ...theme.typography.bodySm, color: theme.colors.textSecondary, fontStyle: 'italic', paddingVertical: theme.spacing.sm },
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  soilItem: { flex: 1, minWidth: '40%', backgroundColor: theme.colors.background, padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  soilLabel: { ...theme.typography.labelSm, color: theme.colors.textTertiary },
  soilValue: { ...theme.typography.headingMd, color: theme.colors.text },
});
