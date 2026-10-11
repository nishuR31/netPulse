import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { curves } from '../constants/theme';

type Props = PropsWithChildren<{
  tint?: 'light' | 'dark';
  tintColor: string;
  borderColor: string;
  specularColor?: string;
  intensity?: number;
  radius?: number;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Premium Liquid Glass Surface:
 * - Silky continuous organic curved corners (no sharp angles)
 * - Translucent backdrop blur with high-performance fallbacks
 * - Specular liquid glass rim reflection along top curvature
 * - Native shadow and elevation
 */
export function GlassSurface({
  children,
  tint = 'dark',
  tintColor,
  borderColor,
  specularColor = 'rgba(255, 255, 255, 0.16)',
  intensity = 30,
  radius = curves.card,
  borderWidth = 1,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius: radius,
          borderWidth,
          borderColor,
          borderCurve: 'continuous',
        },
        style,
      ]}
    >
      {/* Frosted Blur Layer */}
      <BlurView
        intensity={Platform.OS === 'android' ? Math.min(intensity, 30) : intensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />

      {/* Fluid Glass Color Tint */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]} />

      {/* Liquid Specular Rim Highlight */}
      <LinearGradient
        colors={[specularColor, 'rgba(255, 255, 255, 0.03)', 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.65 }}
        style={[
          styles.specularSheen,
          {
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          },
        ]}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  specularSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 42,
    opacity: 0.85,
  },
});
