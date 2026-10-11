import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '../../components/GlassSurface';
import { GlowBlob } from '../../components/GlowBlob';
import { ChipIcon, SunIcon } from '../../components/icons';
import { ThemeSelector } from '../../components/ThemeSelector';
import { type Palette } from '../../constants/theme';
import { useNetwork } from '../../lib/network-context';
import { useTheme } from '../../lib/theme-context';

const BATTERY_STATE_LABEL: Record<number, string> = {
  0: 'Unknown',
  1: 'Discharging / Unplugged',
  2: 'Charging',
  3: 'Full',
};

export default function DeviceScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { connection } = useNetwork();

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<number | null>(null);
  const [lowPowerMode, setLowPowerMode] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [level, state, lowPower] = await Promise.all([
          Battery.getBatteryLevelAsync(),
          Battery.getBatteryStateAsync(),
          Battery.isLowPowerModeEnabledAsync(),
        ]);
        if (!mounted) return;
        setBatteryLevel(level);
        setBatteryState(state);
        setLowPowerMode(lowPower);
      } catch {
        // Battery info isn't available on every platform
      }
    })();

    const levelSub = Battery.addBatteryLevelListener(({ batteryLevel: level }) => setBatteryLevel(level));
    const stateSub = Battery.addBatteryStateListener(({ batteryState: state }) => setBatteryState(state));

    return () => {
      mounted = false;
      levelSub.remove();
      stateSub.remove();
    };
  }, []);

  const details = (connection?.details ?? {}) as unknown as Record<string, unknown>;
  const wifiStrength = typeof details.strength === 'number' ? `${details.strength}%` : null;
  const linkSpeed = typeof details.linkSpeed === 'number' ? `${details.linkSpeed} Mbps` : null;
  const cellularGeneration = typeof details.cellularGeneration === 'string' ? details.cellularGeneration.toUpperCase() : null;
  const ipAddress = typeof details.ipAddress === 'string' ? details.ipAddress : null;

  return (
    <View style={styles.screen}>
      <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
      <GlowBlob size={220} color={palette.blobPrimary} opacity={0.16} tint={palette.blurTint} bottom={100} right={-70} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <ChipIcon size={28} color={palette.foreground} strokeWidth={2.4} />
          <Text style={[styles.title, { color: palette.foreground }]}>Device & System</Text>
        </View>

        {/* Theme Appearance Selector */}
        <Text style={[styles.sectionLabel, { color: palette.secondary }]}>Appearance Theme</Text>
        <ThemeSelector />

        {/* Hardware Specifications */}
        <Text style={[styles.sectionLabel, { color: palette.secondary }]}>Hardware Profile</Text>
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surfaceStrong}
          borderColor={palette.border}
          radius={26}
          intensity={40}
          style={styles.card}
        >
          <Row palette={palette} label="Model" value={Device.modelName ?? 'Unknown'} />
          <Divider color={palette.border} />
          <Row palette={palette} label="Manufacturer" value={Device.brand ?? 'Unknown'} />
          <Divider color={palette.border} />
          <Row palette={palette} label="Operating System" value={`${Device.osName ?? 'Unknown'} ${Device.osVersion ?? ''}`.trim()} />
          <Divider color={palette.border} />
          <Row palette={palette} label="Form Factor" value={deviceTypeLabel(Device.deviceType)} />
        </GlassSurface>

        {/* Power & Energy */}
        <Text style={[styles.sectionLabel, { color: palette.secondary }]}>Power Telemetry</Text>
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={22}
          intensity={35}
          style={styles.card}
        >
          <View style={styles.batteryRow}>
            <View style={styles.batteryTextCol}>
              <Text style={[styles.rowLabel, { color: palette.secondary }]}>Battery Charge</Text>
              <Text style={[styles.batteryVal, { color: palette.foreground }]}>
                {batteryLevel != null ? `${Math.round(batteryLevel * 100)}%` : 'Unavailable'}
              </Text>
            </View>
            {batteryLevel != null && (
              <View style={[styles.batteryBarTrack, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}>
                <View
                  style={[
                    styles.batteryBarFill,
                    {
                      width: `${Math.min(100, Math.max(5, Math.round(batteryLevel * 100)))}%`,
                      backgroundColor:
                        batteryLevel > 0.25 ? palette.online[0] : palette.offline[0],
                    },
                  ]}
                />
              </View>
            )}
          </View>
          <Divider color={palette.border} />
          <Row
            palette={palette}
            label="Charging Status"
            value={batteryState != null ? BATTERY_STATE_LABEL[batteryState] ?? 'Unknown' : 'Unavailable'}
            valueColor={batteryState === 2 ? palette.online[0] : undefined}
          />
          <Divider color={palette.border} />
          <Row palette={palette} label="Low Power Mode" value={lowPowerMode == null ? 'Unavailable' : lowPowerMode ? 'Enabled' : 'Disabled'} />
        </GlassSurface>

        {/* Network Hardware */}
        <Text style={[styles.sectionLabel, { color: palette.secondary }]}>Interface Details</Text>
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={22}
          intensity={35}
          style={styles.card}
        >
          <Row palette={palette} label="Network Link" value={connection?.type ? connection.type.toUpperCase() : 'Unknown'} />
          <Divider color={palette.border} />
          <Row palette={palette} label="Wi-Fi Signal Strength" value={wifiStrength ?? 'Not available'} />
          <Divider color={palette.border} />
          <Row palette={palette} label="Hardware Link Speed" value={linkSpeed ?? 'Not available'} />
          <Divider color={palette.border} />
          <Row palette={palette} label="Cellular Band" value={cellularGeneration ?? 'Not available'} />
          <Divider color={palette.border} />
          <Row palette={palette} label="Assigned IP" value={ipAddress ?? 'Not available'} />
        </GlassSurface>

        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={22}
          intensity={35}
          style={styles.note}
        >
          <Text style={[styles.noteText, { color: palette.secondary }]}>
            Network interfaces are monitored locally through Android NetInfo and Wi-Fi subsystem APIs.
            All telemetry is processed on-device.
          </Text>
        </GlassSurface>
      </ScrollView>
    </View>
  );
}

function deviceTypeLabel(type: Device.DeviceType | null) {
  switch (type) {
    case Device.DeviceType.PHONE:
      return 'Smartphone';
    case Device.DeviceType.TABLET:
      return 'Tablet';
    case Device.DeviceType.DESKTOP:
      return 'Desktop';
    case Device.DeviceType.TV:
      return 'Television';
    default:
      return 'Device';
  }
}

function Row({
  palette,
  label,
  value,
  valueColor,
}: {
  palette: Palette;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: palette.secondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor ?? palette.foreground }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 4 },
  card: { paddingHorizontal: 18, paddingVertical: 4 },
  batteryRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  batteryTextCol: { minWidth: 100 },
  batteryVal: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  batteryBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { fontSize: 13, fontWeight: '500' },
  rowValue: { fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.6 },
  note: { padding: 16 },
  noteText: { fontSize: 12, lineHeight: 18 },
});
