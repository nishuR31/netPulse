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

export function StatusVisual({ status, colors, glowColor, isDark = true }: Props) {
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
      <View
        style={[
          styles.glow,
          {
            backgroundColor: glowColor,
          },
        ]}
      />

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

      {/* Breathing Liquid Glass Orb Container */}
      <Animated.View
        style={[
          styles.orbWrapper,
          {
            transform: [{ scale: breathe }],
          },
        ]}
      >
        <View style={styles.orbInner}>
          {/* Animated Graphic Core - only rotates when checking */}
          {status === 'checking' ? (
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Image
                source={assetSource}
                style={styles.assetImage}
                resizeMode="contain"
              />
            </Animated.View>
          ) : (
            <Image
              source={assetSource}
              style={styles.assetImage}
              resizeMode="contain"
            />
          )}

          {/* Liquid Glass Perimeter Bezel */}
          <View style={styles.glassRim} pointerEvents="none" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: SIZE + 36,
    height: SIZE + 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: SIZE + 54,
    height: SIZE + 54,
    borderRadius: (SIZE + 54) / 2,
    opacity: 0.25,
  },
  rippleRing: {
    position: 'absolute',
    width: SIZE + 16,
    height: SIZE + 16,
    borderRadius: (SIZE + 16) / 2,
    borderWidth: 1.5,
  },
  orbWrapper: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  orbInner: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  assetImage: {
    width: SIZE,
    height: SIZE,
  },
  glassRim: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
});
