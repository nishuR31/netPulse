import * as LocalAuthentication from 'expo-local-authentication';
import { Stack } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlassSurface } from '../components/GlassSurface';
import { GlowBlob } from '../components/GlowBlob';
import { FingerprintIcon } from '../components/icons';
import { NetworkProvider } from '../lib/network-context';
import { SecuritySettings } from '../lib/security-store';
import { ThemeProvider, useTheme } from '../lib/theme-context';

const themeIcons = {
  dark: require('../assets/icon/icon-dark.png'),
  light: require('../assets/icon/icon-light.png'),
};

function AppLockOverlay({ onUnlock }: { onUnlock: () => void }) {
  const { palette, isDark } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, styles.lockOverlay]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#07090E' : '#F8FAFC' }]} />
      <GlowBlob size={260} color={palette.blobPrimary} opacity={0.25} tint={palette.blurTint} top={-50} right={-50} />
      <GlowBlob size={240} color={palette.blobSecondary} opacity={0.18} tint={palette.blurTint} bottom={60} left={-60} />

      <View style={styles.lockContent}>
        <Image
          source={isDark ? themeIcons.dark : themeIcons.light}
          style={styles.lockLogo}
          resizeMode="contain"
        />

        <Text style={[styles.lockTitle, { color: palette.foreground }]}>NetPulse Locked</Text>
        <Text style={[styles.lockSubtitle, { color: palette.secondary }]}>
          Biometric security authentication is required to access your network diagnostics.
        </Text>

        <Pressable
          onPress={onUnlock}
          accessibilityRole="button"
          accessibilityLabel="Unlock with Biometrics"
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <GlassSurface
            tint={palette.blurTint}
            tintColor={palette.surfaceStrong}
            borderColor={palette.borderHighlight}
            radius={999}
            intensity={45}
            style={styles.unlockButton}
          >
            <FingerprintIcon size={24} color={palette.foreground} />
            <Text style={[styles.unlockText, { color: palette.foreground }]}>
              Authenticate with Biometrics
            </Text>
          </GlassSurface>
        </Pressable>
      </View>
    </View>
  );
}

function RootNav() {
  const { isDark } = useTheme();
  const [isLocked, setIsLocked] = useState(false);

  const attemptBiometricAuth = useCallback(async () => {
    try {
      const lockEnabled = await SecuritySettings.getAppLockEnabled();
      if (!lockEnabled) {
        setIsLocked(false);
        return;
      }

      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHw || !isEnrolled) {
        setIsLocked(false);
        return;
      }

      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access NetPulse',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (res.success) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    } catch {
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    // Initial launch check
    (async () => {
      const lockEnabled = await SecuritySettings.getAppLockEnabled();
      if (lockEnabled) {
        setIsLocked(true);
        void attemptBiometricAuth();
      }
    })();

    // App state listener (lock upon backgrounding)
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void SecuritySettings.getAppLockEnabled().then((lockEnabled) => {
          if (lockEnabled) {
            void attemptBiometricAuth();
          }
        });
      } else if (nextState === 'background') {
        void SecuritySettings.getAppLockEnabled().then((lockEnabled) => {
          if (lockEnabled) {
            setIsLocked(true);
          }
        });
      }
    });

    return () => sub.remove();
  }, [attemptBiometricAuth]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      {isLocked && <AppLockOverlay onUnlock={attemptBiometricAuth} />}
    </>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const screenshotBlocked = await SecuritySettings.getScreenshotBlockEnabled();
        if (screenshotBlocked) {
          void ScreenCapture.preventScreenCaptureAsync();
        }
      } catch {
        // Best effort
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NetworkProvider>
          <RootNav />
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  lockOverlay: {
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContent: {
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 16,
    width: '100%',
    maxWidth: 360,
  },
  lockLogo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 8,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  lockSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  unlockText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
