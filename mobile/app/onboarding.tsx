import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/ui/AppButton';
import { theme } from '../constants/theme';
import { settingsService } from '../services/settings';
import { Sprout, BarChart3, ShieldCheck } from 'lucide-react-native';

const ONBOARDING_STEPS = [
  {
    title: 'AgriSense',
    subtitle: 'Smart Agriculture Decision Support',
    description: 'Welcome to AgriSense. We provide machine-learning based agricultural decision support to help you optimize your farming operations.',
    icon: ShieldCheck
  },
  {
    title: 'Crop Recommendation',
    subtitle: 'Data-driven crop choices',
    description: 'Enter your soil and weather inputs. Our ML models will recommend the best crop for your specific conditions based on historical data.',
    icon: Sprout
  },
  {
    title: 'Yield Estimation',
    subtitle: 'Plan your harvest',
    description: 'Estimate your crop yield using available environmental and plot inputs. A helpful tool for your agricultural planning.',
    icon: BarChart3
  }
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleNext = async () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    const settings = await settingsService.getSettings();
    await settingsService.saveSettings({ ...settings, hasCompletedOnboarding: true });
    router.replace('/(tabs)');
  };

  const currentStep = ONBOARDING_STEPS[step];
  const Icon = currentStep.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/* @ts-ignore */}
          <Icon size={80} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View key={index} style={[styles.dot, step === index && styles.activeDot]} />
          ))}
        </View>
        <AppButton 
          title={step === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'} 
          onPress={handleNext} 
        />
        {step < ONBOARDING_STEPS.length - 1 && (
          <AppButton 
            title="Skip" 
            variant="ghost" 
            onPress={finishOnboarding} 
            style={{ marginTop: theme.spacing.sm }} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  iconContainer: { marginBottom: theme.spacing['3xl'], padding: theme.spacing['2xl'], backgroundColor: theme.colors.surface, borderRadius: 100 },
  title: { ...theme.typography.displayMd, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xs },
  subtitle: { ...theme.typography.headingMd, color: theme.colors.primaryDark, textAlign: 'center', marginBottom: theme.spacing.lg },
  description: { ...theme.typography.bodyMd, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  footer: { padding: theme.spacing.xl, paddingBottom: theme.spacing['3xl'] },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: theme.spacing.xl, gap: theme.spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  activeDot: { backgroundColor: theme.colors.primary, width: 24 },
});
