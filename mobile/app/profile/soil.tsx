import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../../components/ui/AppButton';
import { AppCard } from '../../components/ui/AppCard';
import { InputField } from '../../components/forms/InputField';
import { theme } from '../../constants/theme';
import { soilService } from '../../services/soil';
import { SoilData } from '../../types/soil';

export default function SoilDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SoilData>({
    N: '', P: '', K: '', ph: '', moisture: ''
  });

  useEffect(() => {
    soilService.getSoilData().then(s => {
      if (s) setForm(s);
    });
  }, []);

  const updateForm = (field: keyof SoilData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (Object.values(form).some(v => v !== '' && isNaN(parseFloat(v)))) {
      Alert.alert('Validation Error', 'All entered values must be numeric.');
      return;
    }
    setLoading(true);
    await soilService.saveSoilData(form);
    setLoading(false);
    router.back();
  };

  const handleClear = async () => {
    await soilService.clearSoilData();
    setForm({ N: '', P: '', K: '', ph: '', moisture: '' });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Manual Soil Data</Text>
          <Text style={styles.subtitle}>Enter your latest soil test results. This data can be used to quickly prefill analysis forms.</Text>
        </View>

        <AppCard style={styles.card}>
          <InputField label="Nitrogen (N)" unit="kg/ha" keyboardType="decimal-pad" value={form.N} onChangeText={v => updateForm('N', v)} />
          <InputField label="Phosphorus (P)" unit="kg/ha" keyboardType="decimal-pad" value={form.P} onChangeText={v => updateForm('P', v)} />
          <InputField label="Potassium (K)" unit="kg/ha" keyboardType="decimal-pad" value={form.K} onChangeText={v => updateForm('K', v)} />
          <InputField label="Soil pH" keyboardType="decimal-pad" value={form.ph} onChangeText={v => updateForm('ph', v)} />
          <InputField label="Soil Moisture" unit="%" keyboardType="decimal-pad" value={form.moisture} onChangeText={v => updateForm('moisture', v)} containerStyle={{ marginBottom: 0 }} />
        </AppCard>

        <View style={styles.actions}>
          <AppButton title="Save Soil Data" onPress={handleSave} loading={loading} />
          <AppButton title="Clear Data" variant="ghost" onPress={handleClear} style={{ marginTop: theme.spacing.sm }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  header: { marginBottom: theme.spacing.xl },
  title: { ...theme.typography.headingLg, color: theme.colors.text, marginBottom: theme.spacing.xs },
  subtitle: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  card: { padding: theme.spacing.lg },
  actions: { marginTop: theme.spacing.xl },
});
