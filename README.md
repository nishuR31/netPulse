# NetPulse

A high-performance, local-first network utility featuring **Liquid Glassmorphism**, biometric app protection, deep connectivity diagnostics, and on-device privacy security.

Built on **Expo SDK 57 (New Architecture)**, **React Native 0.86**, **React 19.2**, and bundled with **Bun**.

---

## Features

### 1. Home / Pulse
- **Real-Time Connectivity Visualizer**: Themed status orb backed by custom high-resolution renders (`online-dark.png`, `online-light.png`, `offline-dark.png`, `offline-light.png`, and `loading-hemisphere.png`).
- **Liquid Glass Atmosphere**: Multi-layered frosted glass surfaces, specular rim reflection sheens, breathing pulse animations, and ambient halo rings.
- **Instant Telemetry**: Live interface detection (Wi-Fi, Cellular, VPN), gateway reachability status, and round-trip ping latency.
- **Dynamic Brand Header**: Live animated logo with themed app icon badges.

### 2. Analytics & Deep Diagnostics
- **Smooth Bezier Latency Timeline**: Interactive SVG chart with Catmull-Rom cubic bezier curve interpolation and gradient fills.
- **Deep Probe Diagnostics**: Multi-endpoint parallel ping to Google DNS and Cloudflare 1.1.1.1 measuring latency, packet reliability, and jitter variance.
- **Performance Metric Tiles**: Real-time stats for Uptime %, Average Latency, Peak Latency, Best Latency, Outage Count, and Total Sample Count.
- **Local Storage History**: Samples recorded locally on-device via `@react-native-async-storage/async-storage` with clear/reset capability. Zero third-party telemetry.

### 3. Security Shield & Defensive Policies
- **Biometric App Lock**: Real biometric authentication (Face ID / Fingerprint via `expo-local-authentication`). The app automatically locks on background transition and displays a frosted glass authentication overlay.
- **Screen Capture Protection**: Prevents screenshots and masks sensitive network details from the Android/iOS app switcher via `expo-screen-capture`.
- **Live Network Security Scanner**:
  - **HTTPS / TLS Handshake**: Validates TLS 1.3 socket negotiation against trusted CAs.
  - **DNS Resolution Integrity**: Detects DNS hijacking, poisoning, or unauthorized gateway redirects.
  - **VPN Tunnel Verification**: Confirms whether active network traffic is encapsulated in a private tunnel.
  - **Captive Portal Detection**: Alerts on middlebox HTTP 302 captive redirection or open rogue AP interception.
  - **Data Metering Shield**: Warns when connected to expensive or metered carrier tariffs.
- **Security Rating Scorecard**: Instant 0–100 protection score with on-demand manual rescan.
- **Hardware Keychain Storage**: All security settings and policies are saved in the device's secure enclave (`expo-secure-store`).

### 4. Device & System Telemetry
- **Hardware Specifications**: Manufacturer, device model, operating system version, and form factor (`expo-device`).
- **Power Telemetry**: Real-time battery charge percentage with progress bar, charging state, and low-power mode tracking (`expo-battery`).
- **Network Interface Hardware**: Wi-Fi signal strength %, hardware link speed in Mbps, cellular generation (4G/5G), and assigned local IP address.
- **Theme Customizer**: Quick switcher between **Device / System**, **Light**, and **Dark** modes.

---

## Theming & Asset Pipeline

NetPulse provides native theme synchronization through `ThemeProvider` (`lib/theme-context.tsx`):

- **Adaptive Icons**:
  - `assets/icon/icon-dark.png`: Dark mode icon render.
  - `assets/icon/icon-light.png`: Light mode icon render.
  - `assets/icon/icon.png`: Universal launcher icon.
  - `assets/icon/adaptive-foreground.png` & `adaptive-monochrome.png`: Android 13+ wallpaper-tinted adaptive icon.
- **Themed Splash Screen**:
  - Light theme: `assets/icon/icon-light.png` on `#F8FAFC`.
  - Dark theme: `assets/icon/icon-dark.png` on `#07090E`.
- **Status Graphics**:
  - `assets/status/online-dark.png` & `online-light.png`
  - `assets/status/offline-dark.png` & `offline-light.png`
  - `assets/status/loading-hemisphere.png`

---

## Android Permissions

Configured in `app.json` and `android/app/src/main/AndroidManifest.xml`:

| Permission | Purpose |
| :--- | :--- |
| `android.permission.INTERNET` | Reachability probes and latency testing |
| `android.permission.ACCESS_NETWORK_STATE` | Live network interface and metered state detection |
| `android.permission.ACCESS_WIFI_STATE` | Wi-Fi link speed and signal strength metrics |
| `android.permission.USE_BIOMETRIC` | Biometric App Lock authentication |
| `android.permission.USE_FINGERPRINT` | Fallback biometric support |
| `android.permission.VIBRATE` | Tactile feedback on user actions |

---

## Project Structure

```
NetPulse/
├── app/
│   ├── _layout.tsx           # Root navigation, theme provider, Biometric App Lock guard
│   └── (tabs)/
│       ├── _layout.tsx       # Floating liquid-glass bottom tab bar
│       ├── index.tsx         # Home (Pulse orb, live status, quick recheck)
│       ├── analytics.tsx     # Analytics (Bezier chart, deep diagnostics, metrics)
│       ├── security.tsx      # Security (Audit scanner, policies, biometrics)
│       └── device.tsx        # Device (Hardware specs, battery telemetry, theme switcher)
├── components/
│   ├── ConnectivityChart.tsx # SVG Catmull-Rom cubic bezier chart
│   ├── DynamicLogo.tsx       # Live status logo with themed app icon
│   ├── GlassSurface.tsx      # Reusable multi-layer liquid glassmorphism container
│   ├── GlowBlob.tsx          # Blurred ambient background lighting
│   ├── icons.tsx             # Handcrafted SVG vector icon set
│   ├── StatusVisual.tsx      # Themed status orb with custom asset graphics & pulse
│   └── ThemeSelector.tsx     # Segmented theme mode controller
├── constants/
│   └── theme.ts              # Curated light and dark palettes, curves, and layouts
├── lib/
│   ├── connectivity-store.ts # AsyncStorage-backed latency samples & statistical models
│   ├── network-context.tsx   # NetInfo subscription, probes, and diagnostic engine
│   ├── security-store.ts     # SecureStore keychain settings & active security audit engine
│   └── theme-context.tsx     # System / Light / Dark theme state management
├── assets/
│   ├── icon/                 # Adaptive launcher icons, dark/light icons, splash
│   └── status/               # Themed online/offline renders & loading hemisphere
├── app.json                  # Expo configuration with themed splash and permissions
├── package.json              # Dependencies and project scripts
└── tsconfig.json             # TypeScript configuration
```

---

## Development & Build

### Prerequisites
- [Bun](https://bun.sh/) or Node.js (v20+)
- Expo CLI (`bunx expo` or `npx expo`)

### Install Dependencies
```sh
bun install
```

### Type Checking
```sh
bun run typecheck
```

### Start Development Server
```sh
bun start
```

### Build for Android
```sh
bun run android
# Or clean prebuild:
bunx expo prebuild --clean
cd android && ./gradlew assembleRelease
```
