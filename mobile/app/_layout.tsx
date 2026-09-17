import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { settingsService } from '../services/settings';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    settingsService.getSettings().then(settings => {
      setNeedsOnboarding(!settings.hasCompletedOnboarding);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const inTabsGroup = segments[0] === '(tabs)';
    if (needsOnboarding && inTabsGroup) {
      router.replace('/onboarding');
    }
  }, [isReady, needsOnboarding, segments]);

  if (!isReady) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen 
          name="analyze/crop-recommendation" 
          options={{ title: 'Crop Recommendation', presentation: 'card' }} 
        />
        <Stack.Screen 
          name="analyze/yield-estimation" 
          options={{ title: 'Yield Estimation', presentation: 'card' }} 
        />
      </Stack>
    </>
  );
}
