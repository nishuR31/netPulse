import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Status } from '../constants/theme';

export type Sample = {
  t: number; // epoch ms
  status: Status;
  latencyMs: number | null;
  type: string;
};

export type DiagnosticResult = {
  timestamp: number;
  cloudflareMs: number | null;
  googleMs: number | null;
  dnsReachable: boolean;
  minLatency: number | null;
  avgLatency: number | null;
  jitterMs: number | null;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Disconnected';
};

const KEY = 'netpulse.history.v1';
const MAX_SAMPLES = 250;

export async function loadHistory(): Promise<Sample[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendSample(history: Sample[], sample: Sample): Promise<Sample[]> {
  const next = [...history, sample].slice(-MAX_SAMPLES);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Keep in-memory
  }
  return next;
}

export async function clearSavedHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export type HistoryStats = {
  uptimePercent: number;
  avgLatency: number | null;
  peakLatency: number | null;
  bestLatency: number | null;
  jitterMs: number | null;
  outageCount: number;
  samples: number;
};

export function computeStats(history: Sample[]): HistoryStats {
  if (history.length === 0) {
    return {
      uptimePercent: 100,
      avgLatency: null,
      peakLatency: null,
      bestLatency: null,
      jitterMs: null,
      outageCount: 0,
      samples: 0,
    };
  }

  const resolved = history.filter((s) => s.status !== 'checking');
  const onlineCount = resolved.filter((s) => s.status === 'online').length;
  const uptimePercent = resolved.length
    ? Math.round((onlineCount / resolved.length) * 100)
    : 100;

  const latencies = resolved
    .map((s) => s.latencyMs)
    .filter((v): v is number => typeof v === 'number');

  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;
  const peakLatency = latencies.length ? Math.max(...latencies) : null;
  const bestLatency = latencies.length ? Math.min(...latencies) : null;

  // Jitter = average difference between successive latency measurements
  let jitterMs: number | null = null;
  if (latencies.length >= 2) {
    let diffSum = 0;
    for (let i = 1; i < latencies.length; i++) {
      diffSum += Math.abs(latencies[i] - latencies[i - 1]);
    }
    jitterMs = Math.round(diffSum / (latencies.length - 1));
  }

  let outageCount = 0;
  let wasOnline = true;
  for (const s of resolved) {
    const isOnline = s.status === 'online';
    if (wasOnline && !isOnline) outageCount += 1;
    wasOnline = isOnline;
  }

  return {
    uptimePercent,
    avgLatency,
    peakLatency,
    bestLatency,
    jitterMs,
    outageCount,
    samples: resolved.length,
  };
}
