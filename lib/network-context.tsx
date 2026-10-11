import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Status } from '../constants/theme';
import {
  appendSample,
  clearSavedHistory,
  computeStats,
  loadHistory,
  type DiagnosticResult,
  type HistoryStats,
  type Sample,
} from './connectivity-store';

const PROBE_GOOGLE = 'https://www.gstatic.com/generate_204';
const PROBE_CLOUDFLARE = 'https://1.1.1.1/cdn-cgi/trace';
const LATENCY_TIMEOUT_MS = 3500;

async function pingUrl(url: string): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LATENCY_TIMEOUT_MS);
  const start = Date.now();
  try {
    await fetch(url, { method: 'HEAD', signal: controller.signal });
    return Date.now() - start;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type NetworkContextValue = {
  status: Status;
  connection: NetInfoState | null;
  latencyMs: number | null;
  history: Sample[];
  stats: HistoryStats;
  isDiagnosticRunning: boolean;
  diagnosticResult: DiagnosticResult | null;
  refresh: () => Promise<void>;
  runDiagnostics: () => Promise<DiagnosticResult>;
  clearHistory: () => Promise<void>;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<Status>('checking');
  const [connection, setConnection] = useState<NetInfoState | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [history, setHistory] = useState<Sample[]>([]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const historyRef = useRef<Sample[]>([]);

  useEffect(() => {
    loadHistory().then((h) => {
      historyRef.current = h;
      setHistory(h);
    });
  }, []);

  const recordSample = useCallback(async (nextStatus: Status, latency: number | null, type: string) => {
    const sample: Sample = { t: Date.now(), status: nextStatus, latencyMs: latency, type };
    const next = await appendSample(historyRef.current, sample);
    historyRef.current = next;
    setHistory(next);
  }, []);

  const applyState = useCallback(
    (state: NetInfoState) => {
      setConnection(state);
      const online = state.isConnected === true && state.isInternetReachable !== false;
      const nextStatus: Status = online ? 'online' : 'offline';
      setStatus(nextStatus);

      if (online) {
        pingUrl(PROBE_GOOGLE).then((ms) => {
          setLatencyMs(ms);
          void recordSample(nextStatus, ms, state.type);
        });
      } else {
        setLatencyMs(null);
        void recordSample(nextStatus, null, state.type);
      }
    },
    [recordSample],
  );

  const refresh = useCallback(async () => {
    setStatus('checking');
    try {
      const state = await NetInfo.refresh();
      applyState(state);
    } catch {
      setStatus('offline');
      void recordSample('offline', null, 'unknown');
    }
  }, [applyState, recordSample]);

  const runDiagnostics = useCallback(async (): Promise<DiagnosticResult> => {
    setIsDiagnosticRunning(true);
    try {
      const [google, cloudflare] = await Promise.all([
        pingUrl(PROBE_GOOGLE),
        pingUrl(PROBE_CLOUDFLARE),
      ]);

      const validPings = [google, cloudflare].filter((v): v is number => v !== null);
      const minLatency = validPings.length > 0 ? Math.min(...validPings) : null;
      const avgLatency =
        validPings.length > 0
          ? Math.round(validPings.reduce((a, b) => a + b, 0) / validPings.length)
          : null;

      const jitterMs =
        validPings.length === 2 ? Math.abs(validPings[0] - validPings[1]) : 0;

      let rating: DiagnosticResult['rating'] = 'Disconnected';
      if (avgLatency !== null) {
        if (avgLatency < 45 && jitterMs < 15) rating = 'Excellent';
        else if (avgLatency < 120 && jitterMs < 40) rating = 'Good';
        else if (avgLatency < 250) rating = 'Fair';
        else rating = 'Poor';
      }

      const res: DiagnosticResult = {
        timestamp: Date.now(),
        googleMs: google,
        cloudflareMs: cloudflare,
        dnsReachable: validPings.length > 0,
        minLatency,
        avgLatency,
        jitterMs,
        rating,
      };

      setDiagnosticResult(res);
      if (avgLatency !== null) {
        setLatencyMs(avgLatency);
        setStatus('online');
      }
      return res;
    } finally {
      setIsDiagnosticRunning(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    await clearSavedHistory();
    historyRef.current = [];
    setHistory([]);
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribe = NetInfo.addEventListener(applyState);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => computeStats(history), [history]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      status,
      connection,
      latencyMs,
      history,
      stats,
      isDiagnosticRunning,
      diagnosticResult,
      refresh,
      runDiagnostics,
      clearHistory,
    }),
    [
      status,
      connection,
      latencyMs,
      history,
      stats,
      isDiagnosticRunning,
      diagnosticResult,
      refresh,
      runDiagnostics,
      clearHistory,
    ],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return ctx;
}
