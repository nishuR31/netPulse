import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { ChartIcon, ChipIcon, PulseIcon, ShieldIcon } from '../../components/icons';
import { useTheme } from '../../lib/theme-context';

export default function TabsLayout() {
  const { palette } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.mode === 'dark' ? palette.accent : palette.foreground,
        tabBarInactiveTintColor: palette.secondary,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: palette.borderHighlight,
          elevation: 8,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          backgroundColor: 'transparent',
          shadowColor: palette.shadow,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'android' ? 35 : 60}
            tint={palette.blurTint}
            style={[StyleSheet.absoluteFill, { backgroundColor: palette.surfaceStrong }]}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pulse',
          tabBarIcon: ({ color, size }) => <PulseIcon color={color} size={size} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <ChartIcon color={color} size={size} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: 'Security',
          tabBarIcon: ({ color, size }) => <ShieldIcon color={color} size={size} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="device"
        options={{
          title: 'Device',
          tabBarIcon: ({ color, size }) => <ChipIcon color={color} size={size} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  );
}
