import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { InputField } from '../../components/forms/InputField';
import { AppButton } from '../../components/ui/AppButton';
import { AppCard } from '../../components/ui/AppCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { theme } from '../../constants/theme';
import { api } from '../../services/api';
import { historyService } from '../../services/history';
import { soilService } from '../../services/soil';
import { SoilData } from '../../types/soil';

export default function CropRecommendationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSoil, setSavedSoil] = useState<SoilData | null>(null);
  
  const [form, setForm] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: ''
  });

  useEffect(() => {
    soilService.getSoilData().then(setSavedSoil);
  }, []);

  const handleUseSavedSoil = () => {
    if (savedSoil) {
      setForm(prev => ({
        ...prev,
        N: savedSoil.N,
        P: savedSoil.P,
        K: savedSoil.K,
        ph: savedSoil.ph,
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
      N: parseFloat(form.N),
      P: parseFloat(form.P),
      K: parseFloat(form.K),
      temperature: parseFloat(form.temperature),
      humidity: parseFloat(form.humidity),
      ph: parseFloat(form.ph),
      rainfall: parseFloat(form.rainfall),
    };

    if (Object.values(input).some(isNaN)) {
      setError('Please enter valid numeric values');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.predictCrop(input);
      
      if (response.success && response.prediction) {
        const historyItem = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          type: 'crop' as const,
          input,
          result: response.prediction
        };
        await historyService.addHistoryItem(historyItem);
        router.push({ pathname: '/analyze/crop-result', params: { data: JSON.stringify(historyItem) } });
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
        {error && <ErrorState message={error} style={{ marginBottom: theme.spacing.md }} onRetry={handleSubmit} />}

        {savedSoil && (
          <AppCard variant="flat" style={styles.prefillCard}>
            <Text style={styles.prefillText}>Saved manual soil data is available.</Text>
            <AppButton title="Use Saved Data" variant="ghost" onPress={handleUseSavedSoil} />
          </AppCard>
        )}

        <SectionHeader title="SOIL PARAMETERS" style={{ marginTop: 0 }} />
        <AppCard variant="outlined" style={styles.card}>
          <InputField label="Nitrogen (N)" unit="kg/ha" keyboardType="decimal-pad" helperText="Typical range: 0–140" value={form.N} onChangeText={v => updateForm('N', v)} />
          <InputField label="Phosphorus (P)" unit="kg/ha" keyboardType="decimal-pad" helperText="Typical range: 5–145" value={form.P} onChangeText={v => updateForm('P', v)} />
          <InputField label="Potassium (K)" unit="kg/ha" keyboardType="decimal-pad" helperText="Typical range: 5–205" value={form.K} onChangeText={v => updateForm('K', v)} />
          <InputField label="Soil pH" keyboardType="decimal-pad" helperText="Acidic (0) ← → Alkaline (14)" containerStyle={{ marginBottom: 0 }} value={form.ph} onChangeText={v => updateForm('ph', v)} />
        </AppCard>

        <SectionHeader title="ENVIRONMENTAL PARAMETERS" />
        <AppCard variant="outlined" style={styles.card}>
          <InputField label="Temperature" unit="°C" keyboardType="decimal-pad" value={form.temperature} onChangeText={v => updateForm('temperature', v)} />
          <InputField label="Humidity" unit="%" keyboardType="decimal-pad" value={form.humidity} onChangeText={v => updateForm('humidity', v)} />
          <InputField label="Rainfall" unit="mm" keyboardType="decimal-pad" containerStyle={{ marginBottom: 0 }} value={form.rainfall} onChangeText={v => updateForm('rainfall', v)} />
        </AppCard>

        <View style={styles.footer}>
          <AppButton title="🌱 Get Recommendation" onPress={handleSubmit} loading={loading} />
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
