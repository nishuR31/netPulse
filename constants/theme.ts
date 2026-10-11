import type { ColorSchemeName } from 'react-native';

export type Status = 'checking' | 'online' | 'offline';
export type ThemeMode = 'system' | 'light' | 'dark';

export const curves = {
  card: 26,
  cardLarge: 32,
  inner: 18,
  pill: 999,
  sm: 14,
};

export const layout = {
  orbSize: 136,
  radiusCard: curves.card,
  radiusPill: curves.pill,
};

export type Palette = {
  mode: 'light' | 'dark';
  background: readonly [string, string];
  blobPrimary: string;
  blobSecondary: string;
  blobTertiary: string;
  surface: string;
  surfaceStrong: string;
  surfaceSubtle: string;
  border: string;
  borderHighlight: string;
  foreground: string;
  secondary: string;
  muted: string;
  accent: string;
  blurTint: 'light' | 'dark';
  online: readonly [string, string];
  offline: readonly [string, string];
  checking: readonly [string, string];
  shadow: string;
  glassSpecular: string;
};

const dark: Palette = {
  mode: 'dark',
  background: ['#07090E', '#0E131F'],
  blobPrimary: '#10B981',
  blobSecondary: '#F43F5E',
  blobTertiary: '#06B6D4',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceStrong: 'rgba(255, 255, 255, 0.08)',
  surfaceSubtle: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderHighlight: 'rgba(255, 255, 255, 0.22)',
  foreground: '#F8FAFC',
  secondary: '#94A3B8',
  muted: '#64748B',
  accent: '#38BDF8',
  blurTint: 'dark',
  online: ['#34D399', '#059669'],
  offline: ['#FB7185', '#E11D48'],
  checking: ['#818CF8', '#3B82F6'],
  shadow: 'rgba(0, 0, 0, 0.45)',
  glassSpecular: 'rgba(255, 255, 255, 0.18)',
};

const light: Palette = {
  mode: 'light',
  background: ['#F8FAFC', '#E2E8F0'],
  blobPrimary: '#34D399',
  blobSecondary: '#FDA4AF',
  blobTertiary: '#7DD3FC',
  surface: 'rgba(255, 255, 255, 0.58)',
  surfaceStrong: 'rgba(255, 255, 255, 0.72)',
  surfaceSubtle: 'rgba(255, 255, 255, 0.38)',
  border: 'rgba(255, 255, 255, 0.65)',
  borderHighlight: 'rgba(255, 255, 255, 0.90)',
  foreground: '#0F172A',
  secondary: '#475569',
  muted: '#94A3B8',
  accent: '#0284C7',
  blurTint: 'light',
  online: ['#10B981', '#047857'],
  offline: ['#F43F5E', '#BE123C'],
  checking: ['#6366F1', '#2563EB'],
  shadow: 'rgba(15, 23, 42, 0.12)',
  glassSpecular: 'rgba(255, 255, 255, 0.55)',
};

export function getPalette(scheme: ColorSchemeName): Palette {
  return scheme === 'dark' ? dark : light;
}

export function statusGradient(palette: Palette, status: Status): readonly [string, string] {
  if (status === 'online') return palette.online;
  if (status === 'offline') return palette.offline;
  return palette.checking;
}

export function statusLabel(status: Status, online: boolean) {
  if (status === 'checking') return 'Checking connection…';
  return online ? 'Connected & Online' : 'No Internet Access';
}

export function statusSubtitle(status: Status, online: boolean) {
  if (status === 'checking') return 'Analyzing ping, packet flow and DNS reachability';
  return online
    ? 'High-speed internet pipeline is live and stable'
    : 'Device is offline or gateway is unreachable';
}
