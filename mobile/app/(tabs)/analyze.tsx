import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sprout, BarChart3, ChevronRight } from 'lucide-react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppCard } from '../../components/ui/AppCard';
import { theme } from '../../constants/theme';

export default function AnalyzeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Text style={styles.header}>Choose an analysis</Text>
      
      <TouchableOpacity onPress={() => router.push('/analyze/crop-recommendation')} activeOpacity={0.8}>
        <AppCard style={styles.card}>
          <View style={styles.iconContainer}>
            {/* @ts-ignore */}
            <Sprout size={32} color={theme.colors.secondary} />
          </View>
          <Text style={styles.title}>Crop Recommendation</Text>
          <Text style={styles.desc}>
            Enter your soil nutrients and weather conditions to find the best crop for your land.
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>7 inputs required</Text>
            {/* @ts-ignore */}
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </View>
        </AppCard>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/analyze/yield-estimation')} activeOpacity={0.8}>
        <AppCard style={styles.card}>
          <View style={styles.iconContainer}>
            {/* @ts-ignore */}
            <BarChart3 size={32} color={theme.colors.secondary} />
          </View>
          <Text style={styles.title}>Yield Estimation</Text>
          <Text style={styles.desc}>
            Estimate how much you can harvest for a given crop, season, and plot conditions.
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>6 inputs required</Text>
            {/* @ts-ignore */}
            <ChevronRight size={16} color={theme.colors.textTertiary} />
          </View>
        </AppCard>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { ...theme.typography.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing['2xl'] },
  card: { marginBottom: theme.spacing.lg },
  iconContainer: { marginBottom: theme.spacing.md },
  title: { ...theme.typography.headingMd, color: theme.colors.text, marginBottom: theme.spacing.xs },
  desc: { ...theme.typography.bodyMd, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md },
  footerText: { ...theme.typography.bodySm, color: theme.colors.textTertiary },
});
