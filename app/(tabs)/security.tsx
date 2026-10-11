import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '../../components/GlassSurface';
import { GlowBlob } from '../../components/GlowBlob';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  FingerprintIcon,
  LockIcon,
  RefreshIcon,
  ShieldIcon,
  WifiIcon,
} from '../../components/icons';
import { type Palette } from '../../constants/theme';
import { useNetwork } from '../../lib/network-context';
import {
  performSecurityAudit,
  SecuritySettings,
  type SecurityAuditResult,
} from '../../lib/security-store';
import { useTheme } from '../../lib/theme-context';

export default function Security() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { connection } = useNetwork();

  const [appLock, setAppLock] = useState(false);
  const [screenshotBlock, setScreenshotBlock] = useState(false);
  const [dnsAlerts, setDnsAlerts] = useState(true);
  const [wifiCheck, setWifiCheck] = useState(true);
  const [tlsCheck, setTlsCheck] = useState(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);

  const runAudit = useCallback(async () => {
    setAuditing(true);
    try {
      const isConnected = connection?.isConnected === true;
      const isVpn = connection?.type === 'vpn';
      const connectionType = connection?.type ?? 'unknown';
      const details = (connection?.details ?? null) as Record<string, unknown> | null;

      const res = await performSecurityAudit({
        isConnected,
        isVpn,
        connectionType,
        details,
      });
      setAuditResult(res);
    } finally {
      setAuditing(false);
    }
  }, [connection]);

  useEffect(() => {
    (async () => {
      const [lockEnabled, shotBlocked, dnsEnabled, wifiEnabled, tlsEnabled, hasHardware, isEnrolled] =
        await Promise.all([
          SecuritySettings.getAppLockEnabled(),
          SecuritySettings.getScreenshotBlockEnabled(),
          SecuritySettings.getDnsAlertsEnabled(),
          SecuritySettings.getWifiSecurityCheckEnabled(),
          SecuritySettings.getTlsCheckEnabled(),
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);

      setAppLock(lockEnabled);
      setScreenshotBlock(shotBlocked);
      setDnsAlerts(dnsEnabled);
      setWifiCheck(wifiEnabled);
      setTlsCheck(tlsEnabled);
      setBiometricsAvailable(hasHardware && isEnrolled);
      setLoaded(true);
      void runAudit();
    })();
  }, [runAudit]);

  const toggleAppLock = useCallback(async (value: boolean) => {
    if (value) {
      // Validate authentication once before activating lock
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm biometric credential to enable App Lock',
      });
      if (!auth.success) return;
    }
    setAppLock(value);
    await SecuritySettings.setAppLockEnabled(value);
  }, []);

  const toggleScreenshotBlock = useCallback(async (value: boolean) => {
    setScreenshotBlock(value);
    await SecuritySettings.setScreenshotBlockEnabled(value);
    try {
      if (value) {
        await ScreenCapture.preventScreenCaptureAsync();
      } else {
        await ScreenCapture.allowScreenCaptureAsync();
      }
    } catch {
      // Best-effort
    }
  }, []);

  const toggleDnsAlerts = useCallback(async (value: boolean) => {
    setDnsAlerts(value);
    await SecuritySettings.setDnsAlertsEnabled(value);
  }, []);

  const toggleWifiCheck = useCallback(async (value: boolean) => {
    setWifiCheck(value);
    await SecuritySettings.setWifiSecurityCheckEnabled(value);
  }, []);

  const toggleTlsCheck = useCallback(async (value: boolean) => {
    setTlsCheck(value);
    await SecuritySettings.setTlsCheckEnabled(value);
  }, []);

  const isVpn = connection?.type === 'vpn';
  const details = (connection?.details ?? null) as unknown as { isConnectionExpensive?: boolean } | null;
  const isMetered = Boolean(details?.isConnectionExpensive);

  const scoreColor =
    !auditResult
      ? palette.secondary
      : auditResult.score >= 80
      ? palette.online[0]
      : auditResult.score >= 50
      ? palette.checking[0]
      : palette.offline[0];

  return (
    <View style={styles.screen}>
      <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
      <GlowBlob size={220} color={palette.blobSecondary} opacity={0.18} tint={palette.blurTint} top={-40} right={-70} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <ShieldIcon size={28} color={palette.foreground} strokeWidth={2.4} />
            <Text style={[styles.title, { color: palette.foreground }]}>Security Shield</Text>
          </View>

          <Pressable
            onPress={runAudit}
            disabled={auditing}
            accessibilityRole="button"
            accessibilityLabel="Re-audit network security"
          >
            <GlassSurface
              tint={palette.blurTint}
              tintColor={palette.surfaceStrong}
              borderColor={palette.border}
              radius={999}
              intensity={35}
              style={styles.auditBtn}
            >
              {auditing ? (
                <ActivityIndicator size="small" color={palette.foreground} />
              ) : (
                <View style={styles.auditBtnRow}>
                  <RefreshIcon size={14} color={palette.foreground} />
                  <Text style={[styles.auditBtnText, { color: palette.foreground }]}>Scan</Text>
                </View>
              )}
            </GlassSurface>
          </Pressable>
        </View>

        {/* Security Audit Score Card */}
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surfaceStrong}
          borderColor={palette.borderHighlight}
          radius={28}
          intensity={45}
          style={styles.scoreCard}
        >
          <View style={styles.scoreRow}>
            <View>
              <Text style={[styles.scoreLabel, { color: palette.secondary }]}>Security Rating</Text>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {auditResult ? `${auditResult.score}/100` : 'Scanning…'}
              </Text>
              <Text style={[styles.scoreLevel, { color: scoreColor }]}>
                {auditResult ? `${auditResult.level} Protection` : 'Evaluating endpoints'}
              </Text>
            </View>

            <View style={[styles.scoreBadgeWrap, { borderColor: `${scoreColor}40` }]}>
              <ShieldIcon size={38} color={scoreColor} strokeWidth={2.4} />
            </View>
          </View>
        </GlassSurface>

        {/* Real-time Security Checks */}
        <Text style={[styles.sectionLabel, { color: palette.secondary }]}>Active Verifications</Text>
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={22}
          intensity={35}
          style={styles.card}
        >
          {auditResult?.checks.map((chk, i) => (
            <View key={chk.id}>
              {i > 0 && <Divider color={palette.border} />}
              <View style={styles.checkRow}>
                <View style={styles.checkIcon}>
                  {chk.passed ? (
                    <CheckCircleIcon size={20} color={palette.online[0]} />
                  ) : (
                    <AlertCircleIcon size={20} color={chk.severity === 'critical' ? palette.offline[0] : palette.checking[0]} />
                  )}
                </View>
                <View style={styles.checkText}>
                  <Text style={[styles.checkTitle, { color: palette.foreground }]}>{chk.title}</Text>
                  <Text style={[styles.checkDesc, { color: palette.secondary }]}>{chk.description}</Text>
                </View>
              </View>
            </View>
          )) ?? (
            <View style={styles.emptyChecks}>
              <ActivityIndicator size="small" color={palette.foreground} />
              <Text style={[styles.checkDesc, { color: palette.secondary }]}>Probing network security layers…</Text>
            </View>
          )}
        </GlassSurface>

        {/* Protection Policies Toggles */}
        <Text style={[styles.sectionLabel, { color: palette.secondary }]}>Device & App Defenses</Text>
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surfaceStrong}
          borderColor={palette.border}
          radius={24}
          intensity={40}
          style={styles.card}
        >
          <ToggleRow
            palette={palette}
            title="Biometric App Lock"
            subtitle={
              loaded && biometricsAvailable === false
                ? 'No biometrics enrolled on device'
                : 'Require Face ID / fingerprint on launch and background resume'
            }
            value={appLock}
            disabled={!loaded || biometricsAvailable === false}
            onValueChange={toggleAppLock}
            icon={<FingerprintIcon size={20} color={palette.foreground} />}
          />
          <Divider color={palette.border} />
          <ToggleRow
            palette={palette}
            title="Block Screen Capture"
            subtitle="Mask screen contents from screenshot capture and app switcher"
            value={screenshotBlock}
            disabled={!loaded}
            onValueChange={toggleScreenshotBlock}
            icon={<LockIcon size={20} color={palette.foreground} />}
          />
          <Divider color={palette.border} />
          <ToggleRow
            palette={palette}
            title="DNS Leak & Tamper Guard"
            subtitle="Verify resolution integrity and alert on suspicious DNS redirect"
            value={dnsAlerts}
            disabled={!loaded}
            onValueChange={toggleDnsAlerts}
          />
          <Divider color={palette.border} />
          <ToggleRow
            palette={palette}
            title="Wi-Fi Security & Captive Shield"
            subtitle="Analyze Wi-Fi network encryption and detect rogue gateway portals"
            value={wifiCheck}
            disabled={!loaded}
            onValueChange={toggleWifiCheck}
            icon={<WifiIcon size={20} color={palette.foreground} />}
          />
          <Divider color={palette.border} />
          <ToggleRow
            palette={palette}
            title="HTTPS / TLS Transport Check"
            subtitle="Probe TLS certificate chain integrity on every connection test"
            value={tlsCheck}
            disabled={!loaded}
            onValueChange={toggleTlsCheck}
          />
        </GlassSurface>

        {/* Network Security Status Overview */}
        <Text style={[styles.sectionLabel, { color: palette.secondary }]}>Network Interfaces</Text>
        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={22}
          intensity={35}
          style={styles.card}
        >
          <InfoRow
            palette={palette}
            label="VPN Tunnel"
            value={isVpn ? 'Encrypted & Active' : 'Not Detected'}
            tone={isVpn ? 'good' : 'neutral'}
          />
          <Divider color={palette.border} />
          <InfoRow
            palette={palette}
            label="Data Metering"
            value={isMetered ? 'Metered / Expensive Tariff' : 'Unmetered'}
            tone={isMetered ? 'warn' : 'neutral'}
          />
          <Divider color={palette.border} />
          <InfoRow
            palette={palette}
            label="Link Interface"
            value={connection?.type ? connection.type.toUpperCase() : 'Unknown'}
            tone="neutral"
          />
        </GlassSurface>

        <GlassSurface
          tint={palette.blurTint}
          tintColor={palette.surface}
          borderColor={palette.border}
          radius={20}
          intensity={35}
          style={styles.note}
        >
          <Text style={[styles.noteText, { color: palette.secondary }]}>
            All security evaluations are executed locally through device hardware and zero-log
            encrypted probes. Settings are secured inside the device hardware keychain
            (expo-secure-store).
          </Text>
        </GlassSurface>
      </ScrollView>
    </View>
  );
}

function ToggleRow({
  palette,
  title,
  subtitle,
  value,
  disabled,
  onValueChange,
  icon,
}: {
  palette: Palette;
  title: string;
  subtitle: string;
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.toggleRow}>
      {icon && <View style={styles.toggleIcon}>{icon}</View>}
      <View style={styles.toggleText}>
        <Text style={[styles.toggleTitle, { color: palette.foreground }]}>{title}</Text>
        <Text style={[styles.toggleSubtitle, { color: palette.secondary }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: palette.border, true: palette.online[0] }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function InfoRow({
  palette,
  label,
  value,
  tone,
}: {
  palette: Palette;
  label: string;
  value: string;
  tone: 'good' | 'warn' | 'neutral';
}) {
  const color =
    tone === 'good' ? palette.online[0] : tone === 'warn' ? palette.offline[0] : palette.foreground;
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: palette.secondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  auditBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  auditBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  auditBtnText: { fontSize: 12, fontWeight: '700' },
  scoreCard: { padding: 22 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  scoreValue: { fontSize: 32, fontWeight: '900', letterSpacing: -0.8, marginTop: 4 },
  scoreLevel: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  scoreBadgeWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 6 },
  card: { paddingHorizontal: 18, paddingVertical: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 12 },
  checkIcon: { marginTop: 2 },
  checkText: { flex: 1 },
  checkTitle: { fontSize: 14, fontWeight: '700' },
  checkDesc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  emptyChecks: { paddingVertical: 20, alignItems: 'center', gap: 8 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 74,
    gap: 12,
  },
  toggleIcon: { width: 28, alignItems: 'center' },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: 14, fontWeight: '700' },
  toggleSubtitle: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  infoRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.6 },
  note: { padding: 16 },
  noteText: { fontSize: 12, lineHeight: 18 },
});
