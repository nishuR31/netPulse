import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { layout, type Status } from '../constants/theme';

const SIZE = layout.orbSize;

const statusAssets = {
  onlineDark: require('../assets/status/online-dark.png'),
  onlineLight: require('../assets/status/online-light.png'),
  offlineDark: require('../assets/status/offline-dark.png'),
  offlineLight: require('../assets/status/offline-light.png'),
  loading: require('../assets/status/loading-hemisphere.png'),
};

type Props = {
  status: Status;
  colors: readonly [string, string];
  glowColor: string;
  coreColor: string;
  isDark?: boolean;
};

export function StatusVisual({ status, colors, glowColor, coreColor, isDark = true }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;
  const ripple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let spinLoop: Animated.CompositeAnimation | undefined;
    let breatheLoop: Animated.CompositeAnimation | undefined;
    let rippleLoop: Animated.CompositeAnimation | undefined;

    if (status === 'checking') {
      spin.setValue(0);
      spinLoop = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 1300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoop.start();
    } else {
      breathe.setValue(0.96);
      breatheLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1.04,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 0.96,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      breatheLoop.start();

      if (status === 'online') {
        ripple.setValue(0);
        rippleLoop = Animated.loop(
          Animated.timing(ripple, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        );
        rippleLoop.start();
      }
    }

    return () => {
      spinLoop?.stop();
      breatheLoop?.stop();
      rippleLoop?.stop();
    };
  }, [status, spin, breathe, ripple]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] });

  // Select appropriate theme asset
  const assetSource =
    status === 'checking'
      ? statusAssets.loading
      : status === 'online'
      ? isDark
        ? statusAssets.onlineDark
        : statusAssets.onlineLight
      : isDark
      ? statusAssets.offlineDark
      : statusAssets.offlineLight;

  return (
    <View style={styles.frame}>
      {/* Dynamic Ambient Pulsing Halo */}
      <View style={[styles.glow, { backgroundColor: glowColor }]} />

      {/* Ripple ring for online state */}
      {status === 'online' && (
        <Animated.View
          style={[
            styles.rippleRing,
            {
              borderColor: colors[0],
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />
      )}

      {/* Liquid Glass Orb Container */}
      <Animated.View
        style={[
          styles.orb,
          {
            transform: [
              { scale: breathe },
              ...(status === 'checking' ? [{ rotate }] : []),
            ],
          },
        ]}
      >
        {/* Soft Background Gradient Fill */}
        <LinearGradient
          colors={colors}
          start={{ x: 0.1, y: 0.05 }}
          end={{ x: 0.9, y: 0.95 }}
          style={StyleSheet.absoluteFill}
        />

        {/* High Resolution Themed Status Graphic Asset */}
        <Image
          source={assetSource}
          style={styles.assetImage}
          resizeMode="contain"
        />

        {/* Liquid Glass Highlight Curve (Specular reflection) */}
        <View style={styles.highlight} pointerEvents="none" />
        <View style={styles.highlightSubtle} pointerEvents="none" />

        {/* Glass Edge Rim */}
        <View style={styles.glassRim} pointerEvents="none" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: SIZE + 30,
    height: SIZE + 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: SIZE + 48,
    height: SIZE + 48,
    borderRadius: (SIZE + 48) / 2,
    opacity: 0.28,
  },
  rippleRing: {
    position: 'absolute',
    width: SIZE + 10,
    height: SIZE + 10,
    borderRadius: (SIZE + 10) / 2,
    borderWidth: 2,
  },
  orb: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    position: 'relative',
  },
  assetImage: {
    width: SIZE * 0.88,
    height: SIZE * 0.88,
  },
  highlight: {
    position: 'absolute',
    top: 8,
    left: SIZE * 0.18,
    width: SIZE * 0.52,
    height: SIZE * 0.24,
    borderRadius: SIZE * 0.24,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    transform: [{ rotate: '-18deg' }],
  },
  highlightSubtle: {
    position: 'absolute',
    bottom: 12,
    right: SIZE * 0.2,
    width: SIZE * 0.3,
    height: SIZE * 0.12,
    borderRadius: SIZE * 0.12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  glassRim: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});
