import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { AppButton } from '../../components/ui/AppButton';
import { AppCard } from '../../components/ui/AppCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { theme } from '../../constants/theme';
import { api } from '../../services/api';
import { metadataService } from '../../services/metadata';
import { historyService } from '../../services/history';
import { profileService } from '../../services/profile';
import { UserProfile } from '../../types/profile';

export default function YieldEstimationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<UserProfile | null>(null);
  
  const [cropOptions, setCropOptions] = useState<{label: string, value: string}[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<{label: string, value: string}[]>([]);

  const [form, setForm] = useState({
    crop: '', season: '', area: '', temperature: '', humidity: '', soil_moisture: ''
  });

  useEffect(() => {
    loadMetadata();
    profileService.getProfile().then(setSavedProfile);
  }, []);

  const loadMetadata = async () => {
    setMetadataLoading(true);
    const [cropsRes, seasonsRes] = await Promise.all([
      metadataService.getCrops(),
      metadataService.getSeasons()
    ]);
    
    if (cropsRes) {
      setCropOptions(cropsRes.yield_crops.map(c => ({ label: c, value: c })));
    } else {
      setError("Failed to load crops from server.");
    }
    
    if (seasonsRes) {
      setSeasonOptions(seasonsRes.seasons.map(s => ({ label: s, value: s })));
    } else {
      setError("Failed to load seasons from server.");
    }
    setMetadataLoading(false);
  };

  const handleUseSavedProfile = () => {
    if (savedProfile && savedProfile.farmArea) {
      setForm(prev => ({
        ...prev,
        area: savedProfile.farmArea,
        ...(savedProfile.primaryCrop && cropOptions.some(c => c.value === savedProfile.primaryCrop) ? { crop: savedProfile.primaryCrop } : {})
      }));
      setError(null);
    }
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (Object.values(form).some(val => val.trim() === '')) {
      setError('All fields are required');
      return;
    }

    const input = {
      crop: form.crop,
      season: form.season,
      area: parseFloat(form.area),
      temperature: parseFloat(form.temperature),
      humidity: parseFloat(form.humidity),
      soil_moisture: parseFloat(form.soil_moisture),
    };

    if (isNaN(input.area) || isNaN(input.temperature) || isNaN(input.humidity) || isNaN(input.soil_moisture)) {
      setError('Please enter valid numeric values');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.predictYield(input);
      
      if (response.success && response.prediction) {
        const historyItem = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          type: 'yield' as const,
          input,
          result: response.prediction
        };
        await historyService.addHistoryItem(historyItem);
        router.push({ pathname: '/analyze/yield-result', params: { data: JSON.stringify(historyItem) } });
      } else {
        setError(response.error?.message || 'An error occurred during prediction');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {error && <ErrorState message={error} style={{ marginBottom: theme.spacing.md }} onRetry={cropOptions.length === 0 ? loadMetadata : handleSubmit} />}
        
        {savedProfile && savedProfile.farmArea && (
          <AppCard variant="flat" style={styles.prefillCard}>
            <Text style={styles.prefillText}>Profile data is available.</Text>
            <AppButton title="Use Profile Data" variant="ghost" onPress={handleUseSavedProfile} />
          </AppCard>
        )}

        <SectionHeader title="CROP & SEASON" style={{ marginTop: 0 }} />
        <AppCard variant="outlined" style={styles.card}>
          <SelectField label="Crop" options={cropOptions} selectedValue={form.crop} onValueChange={v => updateForm('crop', v)} loading={metadataLoading} />
          <SelectField label="Season" options={seasonOptions} selectedValue={form.season} onValueChange={v => updateForm('season', v)} loading={metadataLoading} containerStyle={{ marginBottom: 0 }} />
        </AppCard>

        <SectionHeader title="FARM INFORMATION" />
        <AppCard variant="outlined" style={styles.card}>
          <InputField label="Cultivated Area" unit="hectares" keyboardType="decimal-pad" helperText="Must be greater than 0" containerStyle={{ marginBottom: 0 }} value={form.area} onChangeText={v => updateForm('area', v)} />
        </AppCard>

        <SectionHeader title="ENVIRONMENTAL PARAMETERS" />
        <AppCard variant="outlined" style={styles.card}>
          <InputField label="Temperature" unit="°C" keyboardType="decimal-pad" value={form.temperature} onChangeText={v => updateForm('temperature', v)} />
          <InputField label="Humidity" unit="%" keyboardType="decimal-pad" value={form.humidity} onChangeText={v => updateForm('humidity', v)} />
          <InputField label="Soil Moisture" unit="%" keyboardType="decimal-pad" containerStyle={{ marginBottom: 0 }} value={form.soil_moisture} onChangeText={v => updateForm('soil_moisture', v)} />
        </AppCard>

        <View style={styles.footer}>
          <AppButton title="📊 Estimate Yield" onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing['3xl'] },
  card: { padding: theme.spacing.lg },
  footer: { marginTop: theme.spacing['2xl'] },
  prefillCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  prefillText: { ...theme.typography.bodySm, color: theme.colors.textSecondary, flex: 1, marginRight: theme.spacing.md },
});
