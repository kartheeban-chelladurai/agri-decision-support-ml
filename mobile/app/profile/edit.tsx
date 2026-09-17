import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../../components/ui/AppButton';
import { AppCard } from '../../components/ui/AppCard';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { theme } from '../../constants/theme';
import { profileService } from '../../services/profile';
import { UserProfile } from '../../types/profile';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserProfile>({
    name: '', farmName: '', location: '', farmArea: '', farmAreaUnit: 'hectares', primaryCrop: ''
  });

  useEffect(() => {
    profileService.getProfile().then(p => {
      if (p) setForm(p);
    });
  }, []);

  const updateForm = (field: keyof UserProfile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (form.farmArea && isNaN(parseFloat(form.farmArea))) {
      Alert.alert('Validation Error', 'Farm area must be a number');
      return;
    }
    setLoading(true);
    await profileService.saveProfile(form);
    setLoading(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppCard style={styles.card}>
          <InputField label="Your Name" value={form.name} onChangeText={v => updateForm('name', v)} />
          <InputField label="Farm Name" value={form.farmName} onChangeText={v => updateForm('farmName', v)} />
          <InputField label="Location" value={form.location} onChangeText={v => updateForm('location', v)} />
          <InputField label="Farm Area" keyboardType="decimal-pad" value={form.farmArea} onChangeText={v => updateForm('farmArea', v)} />
          <SelectField 
            label="Area Unit" 
            selectedValue={form.farmAreaUnit} 
            onValueChange={v => updateForm('farmAreaUnit', v)}
            options={[
              { label: 'Hectares', value: 'hectares' },
              { label: 'Acres', value: 'acres' }
            ]}
          />
          <InputField label="Primary Crop" value={form.primaryCrop} onChangeText={v => updateForm('primaryCrop', v)} containerStyle={{ marginBottom: 0 }} />
        </AppCard>

        <View style={styles.actions}>
          <AppButton title="Save Profile" onPress={handleSave} loading={loading} />
          <AppButton title="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: theme.spacing.sm }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  card: { padding: theme.spacing.lg },
  actions: { marginTop: theme.spacing.xl },
});
