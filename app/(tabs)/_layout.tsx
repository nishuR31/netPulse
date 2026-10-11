import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { ChartIcon, ChipIcon, PulseIcon, ShieldIcon } from '../../components/icons';
import { useTheme } from '../../lib/theme-context';

export default function TabsLayout() {
  const { palette } = useTheme();
  const isDark = palette.mode === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? palette.accent : palette.foreground,
        tabBarInactiveTintColor: palette.secondary,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 14,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 32,
          borderWidth: 1.2,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.70)',
          backgroundColor: 'transparent',
          elevation: 6,
          shadowColor: palette.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.35 : 0.12,
          shadowRadius: 16,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 8 : 6,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden' }]}>
            <BlurView
              intensity={Platform.OS === 'android' ? 28 : 50}
              tint={palette.blurTint}
              style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(255, 255, 255, 0.65)',
                  borderRadius: 32,
                },
              ]}
            />
            <LinearGradient
              colors={[
                isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.85)',
                'transparent',
              ]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.7, y: 0.8 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
            />
          </View>
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
