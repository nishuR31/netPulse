import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import type { Sample } from '../lib/connectivity-store';

const DEFAULT_WIDTH = 320;
const HEIGHT = 148;
const PAD = 16;

/**
 * Builds a smooth Catmull-Rom or cubic bezier curve between points
 */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  if (points.length === 2) return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;

  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export function ConnectivityChart({
  history,
  lineColor,
  gridColor,
  dotOnlineColor,
  dotOfflineColor,
  labelColor,
  width = DEFAULT_WIDTH,
}: {
  history: Sample[];
  lineColor: string;
  gridColor: string;
  dotOnlineColor: string;
  dotOfflineColor: string;
  labelColor: string;
  width?: number;
}) {
  const resolved = history.filter((s) => s.status !== 'checking').slice(-24);

  if (resolved.length < 2) {
    return (
      <View style={[styles.empty, { width, height: HEIGHT }]}>
        <Text style={[styles.emptyText, { color: labelColor }]}>
          Gathering connectivity data — check back after a few ping samples
        </Text>
      </View>
    );
  }

  const latencies = resolved.map((s) => s.latencyMs ?? 0);
  const maxLatency = Math.max(...latencies, 40);
  const usableWidth = width - PAD * 2;
  const usableHeight = HEIGHT - PAD * 2;
  const stepX = usableWidth / (resolved.length - 1);

  const points = resolved.map((s, i) => {
    const value = s.status === 'online' ? (s.latencyMs ?? 0) : maxLatency;
    const y = PAD + usableHeight - (value / maxLatency) * usableHeight;
    return { x: PAD + i * stepX, y, sample: s };
  });

  const linePath = buildSmoothPath(points.map((p) => ({ x: p.x, y: p.y })));
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath =
    linePath +
    ` L${lastPoint.x.toFixed(1)},${(HEIGHT - PAD).toFixed(1)}` +
    ` L${firstPoint.x.toFixed(1)},${(HEIGHT - PAD).toFixed(1)} Z`;

  return (
    <Svg width={width} height={HEIGHT}>
      <Defs>
        <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
          <Stop offset="60%" stopColor={lineColor} stopOpacity={0.12} />
          <Stop offset="100%" stopColor={lineColor} stopOpacity={0.0} />
        </LinearGradient>
      </Defs>

      {/* Grid Guide Lines */}
      {[0.2, 0.5, 0.8].map((f) => (
        <Line
          key={f}
          x1={PAD}
          x2={width - PAD}
          y1={PAD + usableHeight * f}
          y2={PAD + usableHeight * f}
          stroke={gridColor}
          strokeWidth={0.8}
          strokeDasharray="4 4"
          opacity={0.6}
        />
      ))}

      {/* Area Gradient Fill */}
      <Path d={areaPath} fill="url(#chartGradient)" stroke="none" />

      {/* Smooth Liquid Line */}
      <Path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Sample Dots */}
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        const isOnline = p.sample.status === 'online';
        return (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={isLast ? 4.5 : 2.8}
            fill={isOnline ? dotOnlineColor : dotOfflineColor}
            stroke={isLast ? '#FFFFFF' : 'none'}
            strokeWidth={isLast ? 1.5 : 0}
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },
});
