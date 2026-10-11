import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DynamicLogo } from '../../components/DynamicLogo';
import { GlassSurface } from '../../components/GlassSurface';
import { GlowBlob } from '../../components/GlowBlob';
import { RefreshIcon } from '../../components/icons';
import { StatusVisual } from '../../components/StatusVisual';
import {
  statusGradient,
  statusLabel,
  statusSubtitle,
  type Palette,
} from '../../constants/theme';
import { useNetwork } from '../../lib/network-context';
import { useTheme } from '../../lib/theme-context';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useTheme();
  const { status, connection, latencyMs, refresh } = useNetwork();

  const pressScale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  const pressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  const online = status === 'online';
  const checking = status === 'checking';
  const gradient = statusGradient(palette, status);
  const glowColor = gradient[0];

  const details = (connection?.details ?? {}) as unknown as Record<string, unknown>;
  const ipAddress = typeof details.ipAddress === 'string' ? details.ipAddress : null;

  return (
    <View style={styles.screen}>
      <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <GlowBlob size={240} color={palette.blobPrimary} opacity={0.20} tint={palette.blurTint} top={-60} right={-60} />
      <GlowBlob size={200} color={palette.blobSecondary} opacity={0.16} tint={palette.blurTint} bottom={140} left={-70} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Themed Brand Header */}
        <View style={styles.header}>
          <DynamicLogo status={status} palette={palette} size="medium" showBadge={false} useAssetIcon={true} />

          <GlassSurface
            tint={palette.blurTint}
            tintColor={palette.surface}
            borderColor={palette.border}
            radius={999}
            intensity={35}
            style={styles.livePill}
          >
            <View style={[styles.tinyDot, { backgroundColor: checking ? palette.muted : gradient[0] }]} />
            <Text style={[styles.liveText, { color: palette.secondary }]}>
              {checking ? 'CHECKING' : 'LIVE'}
            </Text>
          </GlassSurface>
        </View>

        {/* Central Pulse Orb Glass Card */}
        <Pressable
          onPress={refresh}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={checking}
          accessibilityRole="button"
          accessibilityLabel="Recheck connection status"
          style={styles.centerWrap}
        >
          <Animated.View style={[styles.centerInner, { transform: [{ scale: pressScale }] }]}>
            <GlassSurface
              tint={palette.blurTint}
              tintColor={palette.surfaceStrong}
              borderColor={palette.borderHighlight}
              radius={34}
              intensity={45}
              style={styles.statusCard}
            >
              <StatusVisual
                status={status}
                colors={gradient}
                glowColor={glowColor}
                coreColor={palette.surfaceStrong}
                isDark={isDark}
              />

              <Text accessibilityLiveRegion="polite" style={[styles.status, { color: palette.foreground }]}>
                {statusLabel(status, online)}
              </Text>

              <Text style={[styles.subtitle, { color: palette.secondary }]}>
                {statusSubtitle(status, online)}
              </Text>
            </GlassSurface>
          </Animated.View>
        </Pressable>

        {/* Real-time Connection Metrics Glass Card */}
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={24}
          intensity={35}
          style={styles.info}
        >
          <Row label="Interface" value={connection?.type ? connection.type.toUpperCase() : 'Unknown'} palette={palette} />
          <Divider color={palette.border} />
          <Row
            label="Internet Route"
            value={checking ? 'Probing…' : online ? 'Reachable & Live' : 'Offline / Unreachable'}
            valueColor={online ? palette.online[0] : checking ? palette.checking[0] : palette.offline[0]}
            palette={palette}
          />
          <Divider color={palette.border} />
          <Row
            label="Ping Latency"
            value={latencyMs != null ? `${latencyMs} ms` : online ? 'Measuring…' : '—'}
            palette={palette}
          />
          {ipAddress && (
            <>
              <Divider color={palette.border} />
              <Row label="Local IP" value={ipAddress} palette={palette} />
            </>
          )}
        </GlassSurface>

        {/* Quick Refresh Button */}
        <Pressable
          onPress={refresh}
          disabled={checking}
          accessibilityRole="button"
          accessibilityLabel="Tap to refresh connection status"
          style={({ pressed }) => [pressed && !checking && styles.refreshPressed]}
        >
          <GlassSurface
            tint={palette.blurTint}
            tintColor={palette.surfaceStrong}
            borderColor={palette.borderHighlight}
            radius={999}
            intensity={35}
            style={styles.refresh}
          >
            {checking ? (
              <ActivityIndicator size="small" color={palette.foreground} />
            ) : (
              <View style={styles.refreshRow}>
                <RefreshIcon size={16} color={palette.foreground} />
                <Text style={[styles.refreshText, { color: palette.foreground }]}>Recheck Connection</Text>
              </View>
            )}
          </GlassSurface>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  valueColor,
  palette,
}: {
  label: string;
  value: string;
  valueColor?: string;
  palette: Palette;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: palette.secondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor ?? palette.foreground }]}>{value}</Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 8 },
  tinyDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
  centerWrap: { justifyContent: 'center' },
  centerInner: { alignItems: 'stretch' },
  statusCard: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  status: { marginTop: 22, fontSize: 24, fontWeight: '800', letterSpacing: -0.7, textAlign: 'center' },
  subtitle: { marginTop: 8, fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  info: { paddingHorizontal: 18, paddingVertical: 4 },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.6 },
  rowLabel: { fontSize: 13, fontWeight: '500' },
  rowValue: { fontSize: 13, fontWeight: '700' },
  refresh: { alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingHorizontal: 20 },
  refreshPressed: { opacity: 0.85 },
  refreshRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
});
