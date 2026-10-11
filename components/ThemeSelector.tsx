import { Pressable, StyleSheet, Text, View } from 'react-native';

import { curves, type ThemeMode } from '../constants/theme';
import { useTheme } from '../lib/theme-context';
import { GlassSurface } from './GlassSurface';
import { MoonIcon, SmartphoneIcon, SunIcon } from './icons';

export function ThemeSelector() {
  const { themeMode, setThemeMode, palette } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: typeof SunIcon }[] = [
    { mode: 'system', label: 'Device', icon: SmartphoneIcon },
    { mode: 'light', label: 'Light', icon: SunIcon },
    { mode: 'dark', label: 'Dark', icon: MoonIcon },
  ];

  return (
    <GlassSurface
      tint={palette.blurTint}
      tintColor={palette.surfaceStrong}
      borderColor={palette.border}
      radius={curves.card}
      intensity={30}
      style={styles.container}
    >
      <View style={styles.row}>
        {options.map((opt) => {
          const isActive = themeMode === opt.mode;
          const Icon = opt.icon;
          return (
            <Pressable
              key={opt.mode}
              onPress={() => void setThemeMode(opt.mode)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Set theme to ${opt.label}`}
              style={[
                styles.option,
                isActive && {
                  backgroundColor: palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: palette.borderHighlight,
                  borderWidth: 1,
                },
              ]}
            >
              <Icon
                size={16}
                color={isActive ? palette.accent : palette.secondary}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isActive ? palette.foreground : palette.secondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: curves.inner,
  },
  optionText: {
    fontSize: 12,
  },
});
