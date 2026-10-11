import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

export function GlowBlob({
  size,
  color,
  opacity = 0.22,
  top,
  left,
  right,
  bottom,
}: {
  size: number;
  color: string;
  opacity?: number;
  tint?: 'light' | 'dark'; // kept for backward-compatibility
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}) {
  const half = size / 2;
  const gradientId = `glow_${Math.round(size)}_${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          top,
          left,
          right,
          bottom,
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="45%" stopColor={color} stopOpacity={opacity * 0.65} />
            <Stop offset="75%" stopColor={color} stopOpacity={opacity * 0.2} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
});
