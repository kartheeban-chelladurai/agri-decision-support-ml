import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppCard } from '../../components/ui/AppCard';
import { SelectField } from '../../components/forms/SelectField';
import { theme } from '../../constants/theme';
import { settingsService } from '../../services/settings';
import { AppSettings } from '../../types/settings';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    measurementUnit: 'metric',
    notificationsEnabled: false,
    hasCompletedOnboarding: true,
  });

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await settingsService.saveSettings(newSettings);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>App Settings</Text>
      
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Notifications</Text>
            <Text style={styles.desc}>Receive updates and tips (preference only)</Text>
          </View>
          <Switch 
            value={settings.notificationsEnabled} 
            onValueChange={v => updateSettings({ notificationsEnabled: v })}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.separator} />

        <SelectField 
          label="Theme" 
          selectedValue={settings.theme} 
          onValueChange={v => updateSettings({ theme: v as any })}
          options={[
            { label: 'System Default', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' }
          ]}
          containerStyle={{ marginBottom: theme.spacing.lg }}
        />

        <View style={styles.separator} />

        <SelectField 
          label="Measurement Units" 
          selectedValue={settings.measurementUnit} 
          onValueChange={v => updateSettings({ measurementUnit: v as any })}
          options={[
            { label: 'Metric (hectares, kg)', value: 'metric' },
            { label: 'Imperial (acres, lbs)', value: 'imperial' }
          ]}
          containerStyle={{ marginBottom: 0 }}
        />
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  title: { ...theme.typography.headingLg, color: theme.colors.text, marginBottom: theme.spacing.xl },
  card: { padding: theme.spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textContainer: { flex: 1, paddingRight: theme.spacing.md },
  label: { ...theme.typography.bodyMd, color: theme.colors.text, fontWeight: '600' },
  desc: { ...theme.typography.bodySm, color: theme.colors.textSecondary, marginTop: 4 },
  separator: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.lg },
});
