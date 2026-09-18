import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { settingsService } from '../services/settings';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    settingsService.getSettings().then(() => setIsReady(true));
  }, []);

  // Re-read the persisted flag on every navigation into the tab group rather
  // than caching it in state. Caching it meant that finishing onboarding --
  // which writes hasCompletedOnboarding and replaces to /(tabs) -- was judged
  // against the stale value captured at mount, so the guard immediately sent
  // the user back to /onboarding. On web a full page reload hid this; on a
  // device there is no reload, so onboarding could never be escaped.
  useEffect(() => {
    if (!isReady) return;
    if (segments[0] !== '(tabs)') return;
    let cancelled = false;
    settingsService.getSettings().then(settings => {
      if (!cancelled && !settings.hasCompletedOnboarding) {
        router.replace('/onboarding');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isReady, segments]);

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
