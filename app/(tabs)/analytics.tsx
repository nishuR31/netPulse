import { LinearGradient } from 'expo-linear-gradient';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectivityChart } from '../../components/ConnectivityChart';
import { GlassSurface } from '../../components/GlassSurface';
import { GlowBlob } from '../../components/GlowBlob';
import { ChartIcon, RefreshIcon, SpeedIcon } from '../../components/icons';
import { type Palette } from '../../constants/theme';
import { useNetwork } from '../../lib/network-context';
import { useTheme } from '../../lib/theme-context';

export default function Analytics() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const {
    history,
    stats,
    isDiagnosticRunning,
    diagnosticResult,
    runDiagnostics,
    clearHistory,
  } = useNetwork();

  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear Latency History',
      'Are you sure you want to erase all logged ping samples from device storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => void clearHistory() },
      ],
    );
  }, [clearHistory]);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
      <GlowBlob size={220} color={palette.blobPrimary} opacity={0.18} tint={palette.blurTint} top={-50} left={-60} />
      <GlowBlob size={180} color={palette.blobTertiary} opacity={0.14} tint={palette.blurTint} bottom={100} right={-60} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <ChartIcon size={28} color={palette.foreground} strokeWidth={2.4} />
            <Text style={[styles.title, { color: palette.foreground }]}>Analytics</Text>
          </View>

          <Pressable
            onPress={() => void runDiagnostics()}
            disabled={isDiagnosticRunning}
            accessibilityRole="button"
            accessibilityLabel="Run Deep Diagnostics"
          >
            <GlassSurface
              tint={palette.blurTint}
              tintColor={palette.surfaceStrong}
              borderColor={palette.border}
              radius={999}
              intensity={35}
              style={styles.diagBtn}
            >
              {isDiagnosticRunning ? (
                <ActivityIndicator size="small" color={palette.foreground} />
              ) : (
                <View style={styles.diagBtnRow}>
                  <SpeedIcon size={16} color={palette.foreground} />
                  <Text style={[styles.diagBtnText, { color: palette.foreground }]}>Deep Probe</Text>
                </View>
              )}
            </GlassSurface>
          </Pressable>
        </View>

        <Text style={[styles.caption, { color: palette.secondary }]}>
          Continuous real-time ping history and gateway responsiveness metrics.
        </Text>

        {/* Latency History Chart Glass Card */}
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surfaceStrong}
          borderColor={palette.borderHighlight}
          radius={28}
          intensity={45}
          style={styles.chartCard}
        >
          <View style={styles.chartHeader}>
            <Text style={[styles.cardLabel, { color: palette.secondary }]}>Latency Timeline (ms)</Text>
            {stats.avgLatency != null && (
              <Text style={[styles.cardBadge, { color: palette.accent }]}>
                Avg {stats.avgLatency}ms
              </Text>
            )}
          </View>

          <View style={styles.chartWrap}>
            <ConnectivityChart
              history={history}
              lineColor={palette.blobPrimary}
              gridColor={palette.border}
              dotOnlineColor={palette.online[0]}
              dotOfflineColor={palette.offline[0]}
              labelColor={palette.secondary}
            />
          </View>
        </GlassSurface>

        {/* Diagnostic Result Card (if executed) */}
        {diagnosticResult && (
          <GlassSurface
            tint={palette.blurTint}
            tintColor={palette.surfaceStrong}
            borderColor={palette.borderHighlight}
            radius={24}
            intensity={40}
            style={styles.diagnosticCard}
          >
            <View style={styles.diagTitleRow}>
              <Text style={[styles.diagTitle, { color: palette.foreground }]}>Deep Probe Result</Text>
              <View
                style={[
                  styles.ratingBadge,
                  {
                    backgroundColor:
                      diagnosticResult.rating === 'Excellent' || diagnosticResult.rating === 'Good'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(244, 63, 94, 0.15)',
                    borderColor:
                      diagnosticResult.rating === 'Excellent' || diagnosticResult.rating === 'Good'
                        ? palette.online[0]
                        : palette.offline[0],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ratingText,
                    {
                      color:
                        diagnosticResult.rating === 'Excellent' || diagnosticResult.rating === 'Good'
                          ? palette.online[0]
                          : palette.offline[0],
                    },
                  ]}
                >
                  {diagnosticResult.rating}
                </Text>
              </View>
            </View>

            <View style={styles.diagGrid}>
              <View style={styles.diagCol}>
                <Text style={[styles.diagLabel, { color: palette.secondary }]}>Google DNS</Text>
                <Text style={[styles.diagVal, { color: palette.foreground }]}>
                  {diagnosticResult.googleMs != null ? `${diagnosticResult.googleMs} ms` : 'Failed'}
                </Text>
              </View>
              <View style={styles.diagCol}>
                <Text style={[styles.diagLabel, { color: palette.secondary }]}>Cloudflare 1.1.1.1</Text>
                <Text style={[styles.diagVal, { color: palette.foreground }]}>
                  {diagnosticResult.cloudflareMs != null ? `${diagnosticResult.cloudflareMs} ms` : 'Failed'}
                </Text>
              </View>
              <View style={styles.diagCol}>
                <Text style={[styles.diagLabel, { color: palette.secondary }]}>Jitter Variance</Text>
                <Text style={[styles.diagVal, { color: palette.foreground }]}>
                  {diagnosticResult.jitterMs != null ? `±${diagnosticResult.jitterMs} ms` : '—'}
                </Text>
              </View>
            </View>
          </GlassSurface>
        )}

        {/* Performance Metric Tiles */}
        <View style={styles.statGrid}>
          <StatTile palette={palette} label="Uptime" value={`${stats.uptimePercent}%`} accentColor={palette.online[0]} />
          <StatTile palette={palette} label="Avg latency" value={stats.avgLatency != null ? `${stats.avgLatency} ms` : '—'} />
          <StatTile palette={palette} label="Peak latency" value={stats.peakLatency != null ? `${stats.peakLatency} ms` : '—'} />
          <StatTile palette={palette} label="Best latency" value={stats.bestLatency != null ? `${stats.bestLatency} ms` : '—'} accentColor={palette.accent} />
          <StatTile palette={palette} label="Outages" value={String(stats.outageCount)} accentColor={stats.outageCount > 0 ? palette.offline[0] : undefined} />
          <StatTile palette={palette} label="Samples" value={String(stats.samples)} />
        </View>

        {/* Clear History Button */}
        {history.length > 0 && (
          <Pressable
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear history data"
            style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          >
            <GlassSurface
              tint={palette.blurTint}
              tintColor={palette.surface}
              borderColor={palette.border}
              radius={18}
              intensity={25}
              style={styles.clearBtn}
            >
              <Text style={[styles.clearBtnText, { color: palette.secondary }]}>Reset Sample History</Text>
            </GlassSurface>
          </Pressable>
        )}

        {/* Technical Privacy Note */}
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={22}
          intensity={35}
          style={styles.note}
        >
          <Text style={[styles.noteText, { color: palette.secondary }]}>
            NetPulse measures reachability and round-trip latency locally on this device.
            Zero analytics tracking or third-party telemetries — the metrics stay exclusively in your hands.
          </Text>
        </GlassSurface>
      </ScrollView>
    </View>
  );
}

function StatTile({
  palette,
  label,
  value,
  accentColor,
}: {
  palette: Palette;
  label: string;
  value: string;
  accentColor?: string;
}) {
  return (
    <GlassSurface
      tint={palette.blurTint}
      tintColor={palette.surface}
      borderColor={palette.border}
      radius={20}
      intensity={35}
      style={styles.tile}
    >
      <Text style={[styles.tileValue, { color: accentColor ?? palette.foreground }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: palette.secondary }]}>{label}</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  diagBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  diagBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diagBtnText: { fontSize: 12, fontWeight: '700' },
  caption: { fontSize: 13, marginTop: -8, marginBottom: 2 },
  chartCard: { paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  chartHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  cardLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  cardBadge: { fontSize: 12, fontWeight: '700' },
  chartWrap: { alignItems: 'center', justifyContent: 'center' },
  diagnosticCard: { padding: 18, gap: 14 },
  diagTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diagTitle: { fontSize: 14, fontWeight: '700' },
  ratingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  ratingText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  diagGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  diagCol: { alignItems: 'center', flex: 1 },
  diagLabel: { fontSize: 11, fontWeight: '500' },
  diagVal: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '31%', paddingVertical: 16, alignItems: 'center', gap: 4 },
  tileValue: { fontSize: 18, fontWeight: '800' },
  tileLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  clearBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  clearBtnText: { fontSize: 12, fontWeight: '600' },
  note: { padding: 16 },
  noteText: { fontSize: 12, lineHeight: 18 },
});
