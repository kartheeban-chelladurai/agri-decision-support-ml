import { Tabs } from 'expo-router';
import { Home, FlaskConical, ClipboardList, User } from 'lucide-react-native';
import { theme } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // @ts-ignore
          tabBarIcon: ({ color }) => <Home color={color as string} size={24} />,
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: 'Analyze',
          // @ts-ignore
          tabBarIcon: ({ color }) => <FlaskConical color={color as string} size={24} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          // @ts-ignore
          tabBarIcon: ({ color }) => <ClipboardList color={color as string} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          // @ts-ignore
          tabBarIcon: ({ color }) => <User color={color as string} size={24} />,
        }}
      />
    </Tabs>
  );
}
