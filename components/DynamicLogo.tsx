import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { curves, type Palette, type Status } from '../constants/theme';

const themeIcons = {
  dark: require('../assets/icon/icon-dark.png'),
  light: require('../assets/icon/icon-light.png'),
};

type Props = {
  status: Status;
  palette: Palette;
  size?: 'compact' | 'medium' | 'large';
  showBadge?: boolean;
  useAssetIcon?: boolean;
};

export function DynamicLogo({
  status,
  palette,
  size = 'compact',
  showBadge = true,
  useAssetIcon = true,
}: Props) {
  const isOnline = status === 'online';
  const isChecking = status === 'checking';
  const isDark = palette.mode === 'dark';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | undefined;

    if (isOnline) {
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 900,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(rippleAnim, {
              toValue: 1,
              duration: 1800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(rippleAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      animLoop.start();
    } else if (isChecking) {
      rotateAnim.setValue(0);
      animLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animLoop.start();
    } else {
      pulseAnim.setValue(1);
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.94,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      animLoop.start();
    }

    return () => {
      animLoop?.stop();
    };
  }, [isOnline, isChecking, pulseAnim, rippleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.5, 0.2, 0],
  });

  const iconSize = size === 'large' ? 44 : size === 'medium' ? 36 : 30;
  const statusColor = isOnline
    ? palette.online[0]
    : isChecking
    ? palette.checking[0]
    : palette.offline[0];

  const statusBg = isOnline
    ? 'rgba(16, 185, 129, 0.15)'
    : isChecking
    ? 'rgba(99, 102, 241, 0.15)'
    : 'rgba(244, 63, 94, 0.15)';

  return (
    <View style={styles.container}>
      {/* Icon Frame */}
      <View style={[styles.iconWrap, { width: iconSize, height: iconSize }]}>
        {/* Living Ripple Aura (when online) */}
        {isOnline && (
          <Animated.View
            style={[
              styles.aura,
              {
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize / 2,
                backgroundColor: statusColor,
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
        )}

        {/* Dynamic Animated Core */}
        <Animated.View
          style={[
            styles.emblem,
            {
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
              backgroundColor: statusBg,
              borderColor: isOnline
                ? 'rgba(52, 211, 153, 0.5)'
                : isChecking
                ? 'rgba(129, 140, 248, 0.5)'
                : 'rgba(251, 113, 133, 0.5)',
              transform: isChecking
                ? [{ rotate: spin }]
                : [{ scale: pulseAnim }],
            },
          ]}
        >
          {useAssetIcon ? (
            <Image
              source={isDark ? themeIcons.dark : themeIcons.light}
              style={{ width: iconSize * 0.72, height: iconSize * 0.72, borderRadius: iconSize * 0.36 }}
              resizeMode="contain"
            />
          ) : isChecking ? (
            <Svg width={iconSize * 0.6} height={iconSize * 0.6} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke={statusColor}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </Svg>
          ) : isOnline ? (
            <Svg width={iconSize * 0.6} height={iconSize * 0.6} viewBox="0 0 24 24" fill="none">
              <Path
                d="M2 12h3.5l2.5-6 4 13 3-9 2 4h5"
                stroke={statusColor}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="19" cy="8" r="1.5" fill={statusColor} />
            </Svg>
          ) : (
            <Svg width={iconSize * 0.6} height={iconSize * 0.6} viewBox="0 0 24 24" fill="none">
              <Path
                d="M2 12h3.5l1.5-3.5M17 12h5M8.5 15l2 3.5 1.5-4.5"
                stroke={statusColor}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M4 4l16 16"
                stroke={statusColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          )}
        </Animated.View>
      </View>

      {/* Typography & Dynamic Status Text */}
      <View style={styles.textColumn}>
        <View style={styles.brandRow}>
          <Text style={[styles.brandText, { color: palette.foreground }]}>
            Net<Text style={{ color: statusColor }}>Pulse</Text>
          </Text>
        </View>

        {showBadge && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: statusBg,
                borderColor: `${statusColor}33`,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {isChecking ? 'PROBING…' : isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aura: {
    position: 'absolute',
  },
  emblem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  textColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: curves.pill,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
