import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { theme } from '../../constants/theme';
import { historyService } from '../../services/history';
import { HistoryItem } from '../../types/history';
import { Trash2 } from 'lucide-react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    const history = await historyService.getHistory();
    setItems(history);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const clearHistory = () => {
    Alert.alert('Clear History', 'Are you sure you want to delete all history? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: async () => {
        await historyService.clearHistory();
        setItems([]);
      }},
    ]);
  };

  const deleteItem = (id: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this prediction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await historyService.deleteHistoryItem(id);
        loadHistory();
      }},
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {items.length > 0 ? (
        items.map(item => (
          <AppCard key={item.id} style={styles.historyCard} variant="standard">
            <View style={styles.cardHeader}>
              <Text style={styles.historyType}>{item.type === 'crop' ? '🌱 Crop Recommendation' : '📊 Yield Estimation'}</Text>
              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                {/* @ts-ignore */}
                <Trash2 size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={styles.historyResult}>
              {item.type === 'crop' ? item.result.crop.toUpperCase() : `${item.result.total_production.toLocaleString()} units`}
            </Text>
            <Text style={styles.historyDate}>{new Date(item.timestamp).toLocaleString()}</Text>
            {item.type === 'crop' ? (
              <AppButton 
                title="View Result" 
                variant="ghost" 
                style={styles.viewBtn} 
                onPress={() => router.push({ pathname: '/analyze/crop-result', params: { data: JSON.stringify(item) } })} 
              />
            ) : (
              <AppButton 
                title="View Result" 
                variant="ghost" 
                style={styles.viewBtn} 
                onPress={() => router.push({ pathname: '/analyze/yield-result', params: { data: JSON.stringify(item) } })} 
              />
            )}
          </AppCard>
        ))
      ) : (
        <AppCard style={styles.emptyState} variant="outlined">
          <Text style={styles.emptyText}>Start your first crop recommendation or yield estimation.</Text>
          <AppButton title="Start Analysis" variant="ghost" onPress={() => router.replace('/(tabs)/analyze')} style={{ marginTop: theme.spacing.md }} />
        </AppCard>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl },
  title: { ...theme.typography.headingLg, color: theme.colors.text },
  clearText: { ...theme.typography.bodyMd, color: theme.colors.error },
  emptyState: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  historyCard: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xs },
  historyType: { ...theme.typography.labelSm, color: theme.colors.textTertiary },
  historyResult: { ...theme.typography.headingLg, color: theme.colors.primaryDark, marginBottom: theme.spacing.xs },
  historyDate: { ...theme.typography.bodySm, color: theme.colors.textSecondary },
  viewBtn: { marginTop: theme.spacing.md, alignSelf: 'flex-start', paddingHorizontal: 0 },
});
