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
 * Premium Continuous Liquid Glass Surface:
 * - Dual-layer architecture: Outer shadow wrapper + inner anti-aliased clipped glass container
 * - Prevents Android square corner clipping bugs and elevation bleeding
 * - BlurView and tint layers strictly bounded with matching continuous corner radii
 * - Seamless diagonal specular reflection across full surface (no hard horizontal cutoff seams)
 */
export function GlassSurface({
  children,
  tint = 'dark',
  tintColor,
  borderColor,
  specularColor = 'rgba(255, 255, 255, 0.16)',
  intensity = 30,
  radius = curves.card,
  borderWidth = 1.2,
  style,
}: Props) {
  // Separate layout/margin/dimension styles for outer wrapper vs internal padding
  const flatStyle = StyleSheet.flatten(style) || {};
  const {
    margin,
    marginHorizontal,
    marginVertical,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    flex,
    width,
    height,
    alignSelf,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
    ...innerStyles
  } = flatStyle;

  const outerLayoutStyles: ViewStyle = {
    margin,
    marginHorizontal,
    marginVertical,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    flex,
    width,
    height,
    alignSelf,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
  };

  return (
    <View
      style={[
        styles.outerShadowWrapper,
        {
          borderRadius: radius,
        },
        outerLayoutStyles,
      ]}
    >
      {/* Inner Clipped Glass Container */}
      <View
        style={[
          styles.innerClippedGlass,
          {
            borderRadius: radius,
            borderWidth,
            borderColor,
            borderCurve: 'continuous',
          },
          innerStyles,
        ]}
      >
        {/* Anti-aliased Frosted Blur Layer */}
        <BlurView
          intensity={Platform.OS === 'android' ? Math.min(intensity, 28) : intensity}
          tint={tint}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              overflow: 'hidden',
            },
          ]}
        />

        {/* Translucent Fluid Glass Tint */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: tintColor,
              borderRadius: radius,
            },
          ]}
        />

        {/* Seamless Liquid Specular Bezel Sheen - Full diagonal gradient, zero hard cutoffs */}
        <LinearGradient
          colors={[
            specularColor,
            'rgba(255, 255, 255, 0.04)',
            'transparent',
            'rgba(255, 255, 255, 0.015)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.85 }}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
            },
          ]}
          pointerEvents="none"
        />

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 3,
  },
  innerClippedGlass: {
    overflow: 'hidden',
    position: 'relative',
    borderCurve: 'continuous',
  },
});
